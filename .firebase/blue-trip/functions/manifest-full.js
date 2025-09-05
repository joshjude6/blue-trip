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
		client: {start:"_app/immutable/entry/start.DTBwjvu5.js",app:"_app/immutable/entry/app.DtdC90ZK.js",imports:["_app/immutable/entry/start.DTBwjvu5.js","_app/immutable/chunks/CZ0F4_i_.js","_app/immutable/chunks/Co216k44.js","_app/immutable/entry/app.DtdC90ZK.js","_app/immutable/chunks/CB_6scbe.js","_app/immutable/chunks/Co216k44.js","_app/immutable/chunks/DqAD-f_b.js","_app/immutable/chunks/DGlzIWkq.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js')),
			__memo(() => import('./nodes/6.js'))
		],
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
				id: "/kryss",
				pattern: /^\/kryss\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/login",
				pattern: /^\/login\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/user",
				pattern: /^\/user\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
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
