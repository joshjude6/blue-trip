export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png","fonts/Kalmansk-Regular.otf","fonts/SaoTorpes.otf"]),
	mimeTypes: {".png":"image/png",".otf":"font/otf"},
	_: {
		client: {start:"_app/immutable/entry/start.CvalTxku.js",app:"_app/immutable/entry/app.BP9ORcv9.js",imports:["_app/immutable/entry/start.CvalTxku.js","_app/immutable/chunks/Djnv6NUp.js","_app/immutable/chunks/2PuDm_BP.js","_app/immutable/chunks/Dv8o53ty.js","_app/immutable/chunks/DIeogL5L.js","_app/immutable/entry/app.BP9ORcv9.js","_app/immutable/chunks/zcC-cj0P.js","_app/immutable/chunks/Dv8o53ty.js","_app/immutable/chunks/DIeogL5L.js","_app/immutable/chunks/Bzak7iHL.js","_app/immutable/chunks/2PuDm_BP.js","_app/immutable/chunks/1Evf5gOy.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js')),
			__memo(() => import('./nodes/6.js')),
			__memo(() => import('./nodes/7.js')),
			__memo(() => import('./nodes/8.js')),
			__memo(() => import('./nodes/9.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/admin",
				pattern: /^\/admin\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/blue",
				pattern: /^\/blue\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/history",
				pattern: /^\/history\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/kryss",
				pattern: /^\/kryss\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/login",
				pattern: /^\/login\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/ovinger",
				pattern: /^\/ovinger\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/user",
				pattern: /^\/user\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 9 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
