const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Configure your email transport using environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Trigger when a new kryss is added to kryssLog
exports.sendKryssNotification = functions
  .region('europe-west1')
  .firestore
  .document('kryssLog/{logId}')
  .onCreate(async (snap, context) => {
    const kryssData = snap.data();
    
    // Get receiver's email from users collection
    const receiverDoc = await admin.firestore()
      .collection('users')
      .doc(kryssData.receiverId)
      .get();
    
    if (!receiverDoc.exists) {
      console.log('Receiver not found');
      return null;
    }
    
    const receiverData = receiverDoc.data();
    const receiverEmail = receiverData.email;
    
    if (!receiverEmail) {
      console.log('Receiver has no email');
      return null;
    }
    
    // Check if user has email notifications enabled (optional)
    if (receiverData.emailNotifications === false) {
      console.log('User has disabled email notifications');
      return null;
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: receiverEmail,
      subject: `Du har fått ${kryssData.amount} kryss! Gratulerer! ❌`,
      html: `
        <h2>Du har fått ${kryssData.amount} kryss!</h2>
        <p><strong>Fra:</strong> ${kryssData.giverName}</p>
        <p><strong>Grunn:</strong> ${kryssData.reason}</p>
        <p><strong>Tidspunkt:</strong> ${new Date(kryssData.timestamp.toDate()).toLocaleString('no-NO')}</p>
        <p>Logg inn for å se alle dine kryss: <a href="https://your-site.web.app/kryss">Se krysshistorikk</a></p>
      `
    };
    
    try {
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully to', receiverEmail);
      return null;
    } catch (error) {
      console.error('Error sending email:', error);
      return null;
    }
  });

// Callable function to update user email in both Auth and Firestore
exports.updateUserEmail = functions
  .region('europe-west1')
  .https
  .onCall(async (data, context) => {
    // Check if the caller is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to call this function.'
      );
    }

    // Check if the caller is an admin
    const callerDoc = await admin.firestore()
      .collection('users')
      .doc(context.auth.uid)
      .get();
    
    if (!callerDoc.exists || !callerDoc.data().isAdmin) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can update user emails.'
      );
    }

    const { userId, newEmail } = data;

    if (!userId || !newEmail) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'userId and newEmail are required.'
      );
    }

    try {
      // Update email in Firebase Authentication
      await admin.auth().updateUser(userId, {
        email: newEmail
      });

      // Update email in Firestore
      await admin.firestore()
        .collection('users')
        .doc(userId)
        .update({
          email: newEmail
        });

      return { 
        success: true, 
        message: `Email updated successfully to ${newEmail}` 
      };
    } catch (error) {
      console.error('Error updating email:', error);
      throw new functions.https.HttpsError(
        'internal',
        `Failed to update email: ${error.message}`
      );
    }
  });

// Scan for users in Auth without Firestore documents
exports.scanMissingUserDocuments = functions
  .region('europe-west1')
  .https
  .onCall(async (data, context) => {
    // Check if the caller is authenticated and is an admin
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated.'
      );
    }

    const callerDoc = await admin.firestore()
      .collection('users')
      .doc(context.auth.uid)
      .get();
    
    if (!callerDoc.exists || !callerDoc.data().isAdmin) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can scan users.'
      );
    }

    try {
      const missingUsers = [];
      
      // Get all Auth users
      const listUsersResult = await admin.auth().listUsers();
      
      // Check each user for Firestore document
      for (const userRecord of listUsersResult.users) {
        const userDoc = await admin.firestore()
          .collection('users')
          .doc(userRecord.uid)
          .get();
        
        if (!userDoc.exists) {
          missingUsers.push({
            uid: userRecord.uid,
            email: userRecord.email || null,
            displayName: userRecord.displayName || null
          });
        }
      }

      return {
        success: true,
        missingUsers: missingUsers,
        count: missingUsers.length
      };
    } catch (error) {
      console.error('Error scanning users:', error);
      throw new functions.https.HttpsError(
        'internal',
        `Failed to scan users: ${error.message}`
      );
    }
  });

// Fix missing user documents by creating them
exports.fixMissingUserDocuments = functions
  .region('europe-west1')
  .https
  .onCall(async (data, context) => {
    // Check if the caller is authenticated and is an admin
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated.'
      );
    }

    const callerDoc = await admin.firestore()
      .collection('users')
      .doc(context.auth.uid)
      .get();
    
    if (!callerDoc.exists || !callerDoc.data().isAdmin) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can fix users.'
      );
    }

    try {
      let created = 0;
      
      // Get all Auth users
      const listUsersResult = await admin.auth().listUsers();
      
      // Check and create missing documents
      for (const userRecord of listUsersResult.users) {
        const userDoc = await admin.firestore()
          .collection('users')
          .doc(userRecord.uid)
          .get();
        
        if (!userDoc.exists) {
          // Create the missing document with default values
          await admin.firestore()
            .collection('users')
            .doc(userRecord.uid)
            .set({
              email: userRecord.email || '',
              fornavn: userRecord.displayName || 'Unknown',
              etternavn: '',
              isAdmin: false,
              totalCrosses: 0,
              drinkCount: 0,
              createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
          created++;
        }
      }

      return {
        success: true,
        created: created,
        message: `Created ${created} user document(s)`
      };
    } catch (error) {
      console.error('Error fixing users:', error);
      throw new functions.https.HttpsError(
        'internal',
        `Failed to fix users: ${error.message}`
      );
    }
  });

// Add quote to quoteLog (uses Admin SDK so it is not blocked by client Firestore rules)
exports.addQuote = functions
  .region('europe-west1')
  .https
  .onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to add quotes.'
      );
    }

    const quote = (data?.quote || '').toString().trim();
    const saidBy = (data?.saidBy || '').toString().trim();

    if (!quote || !saidBy) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Both quote and saidBy are required.'
      );
    }

    if (quote.length > 250 || saidBy.length > 80) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Quote or saidBy exceeds max length.'
      );
    }

    try {
      const userDoc = await admin.firestore()
        .collection('users')
        .doc(context.auth.uid)
        .get();

      const submittedByName = userDoc.exists
        ? (userDoc.data().fornavn || 'Unknown')
        : 'Unknown';

      const createdRef = await admin.firestore().collection('quoteLog').add({
        quote,
        saidBy,
        submittedById: context.auth.uid,
        submittedByName,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      return { success: true, id: createdRef.id };
    } catch (error) {
      console.error('Error adding quote:', error);
      throw new functions.https.HttpsError(
        'internal',
        `Failed to add quote: ${error.message}`
      );
    }
  });

// Read quotes from quoteLog via callable (works even when client lacks direct collection permissions)
exports.getQuotes = functions
  .region('europe-west1')
  .https
  .onCall(async (data, context) => {
    try {
      const showAll = data?.showAll === true;
      const maxItems = showAll ? 300 : 25;

      const snapshot = await admin.firestore()
        .collection('quoteLog')
        .orderBy('timestamp', 'desc')
        .limit(maxItems)
        .get();

      const quotes = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          quote: d.quote || '',
          saidBy: d.saidBy || 'Ukjent',
          submittedByName: d.submittedByName || 'Ukjent',
          timestampMs: d.timestamp && d.timestamp.toMillis ? d.timestamp.toMillis() : null
        };
      });

      return { success: true, quotes };
    } catch (error) {
      console.error('Error getting quotes:', error);
      throw new functions.https.HttpsError(
        'internal',
        `Failed to fetch quotes: ${error.message}`
      );
    }
  });

// Delete quote from quoteLog (admin only)
exports.deleteQuote = functions
  .region('europe-west1')
  .https
  .onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to delete quotes.'
      );
    }

    const quoteId = (data?.quoteId || '').toString().trim();
    if (!quoteId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'quoteId is required.'
      );
    }

    try {
      const adminCheckDoc = await admin.firestore()
        .collection('users')
        .doc(context.auth.uid)
        .get();

      if (!adminCheckDoc.exists || adminCheckDoc.data().isAdmin !== true) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'Only admins can delete quotes.'
        );
      }

      await admin.firestore()
        .collection('quoteLog')
        .doc(quoteId)
        .delete();

      return { success: true, deletedId: quoteId };
    } catch (error) {
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      console.error('Error deleting quote:', error);
      throw new functions.https.HttpsError(
        'internal',
        `Failed to delete quote: ${error.message}`
      );
    }
  });
