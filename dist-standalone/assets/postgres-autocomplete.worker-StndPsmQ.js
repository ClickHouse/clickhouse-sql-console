let h=null;function A(){return typeof process<"u"&&process.versions!=null&&(process.versions.node!=null||process.versions.bun!=null)}async function b(){if(h)return h;const t=(await import("./pgls-CS0hgUEk.js")).default,e={};if(A()){const{readFileSync:s}=await Promise.resolve().then(function(){return E}),{fileURLToPath:a}=await Promise.resolve().then(function(){return E}),{dirname:l,join:_}=await Promise.resolve().then(function(){return E}),p=a(import.meta.url),S=l(p),w=_(S,"..","wasm","pgls.wasm");e.wasmBinary=s(w)}else e.locateFile= s=>s.endsWith(".wasm")?new URL("/sql-console/assets/pgls-BPw04Y9G.wasm",import.meta.url).href:s;const r=await t(e),n=r._pgls_init();if(n!==0)throw new Error(`Failed to initialize PGLS: error code ${n}`);return h=r,r}function o(t, e){const r=t.lengthBytesUTF8(e)+1,n=t._malloc(r);return t.stringToUTF8(e,n,r),n}function c(t, e){if(e===0)return null;const r=t.UTF8ToString(e);return t._pgls_free_string(e),r}function g(t){if(t===null)return null;if(t.startsWith("ERROR:"))throw new Error(t.substring(7).trim());return JSON.parse(t)}class T{constructor(e){this.module=e}setSchema(e){const r=typeof e=="string"?e:JSON.stringify(e),n=o(this.module,r);try{const s=this.module._pgls_set_schema(n),a=c(this.module,s);if(a!==null)throw new Error(a)}finally{this.module._free(n)}}clearSchema(){this.module._pgls_clear_schema()}insertFile(e, r){const n=o(this.module,e),s=o(this.module,r);try{const a=this.module._pgls_insert_file(n,s),l=c(this.module,a);if(l!==null)throw new Error(l)}finally{this.module._free(n),this.module._free(s)}}removeFile(e){const r=o(this.module,e);try{this.module._pgls_remove_file(r)}finally{this.module._free(r)}}lint(e){const r=o(this.module,e);try{const n=this.module._pgls_lint(r),s=c(this.module,n);return g(s)??[]}finally{this.module._free(r)}}complete(e, r){const n=o(this.module,e);try{const s=this.module._pgls_complete(n,r),a=c(this.module,s);return g(a)??[]}finally{this.module._free(n)}}hover(e, r){const n=o(this.module,e);try{const s=this.module._pgls_hover(n,r),a=c(this.module,s);if(a===null)return null;if(a.startsWith("ERROR:"))throw new Error(a.substring(7).trim());return a}finally{this.module._free(n)}}parse(e){const r=o(this.module,e);try{const n=this.module._pgls_parse(r),s=c(this.module,n);return g(s)??[]}finally{this.module._free(r)}}splitStatements(e){const r=o(this.module,e);try{const n=this.module._pgls_split_statements(r),s=c(this.module,n);return g(s)??[]}finally{this.module._free(r)}}version(){const e=this.module._pgls_version();return c(this.module,e)??"unknown"}}async function O(t){const e=await b();return new T(e)}const k=`
  SELECT
    oid::int AS id,
    nspname AS name,
    pg_catalog.pg_get_userbyid(nspowner) AS owner
  FROM pg_catalog.pg_namespace
  WHERE nspname NOT LIKE 'pg_%'
    AND nspname != 'information_schema'
  ORDER BY nspname
`,R=`
  SELECT
    c.oid::int AS id,
    n.nspname AS schema,
    c.relname AS name,
    CASE c.relkind
      WHEN 'r' THEN 'Ordinary'
      WHEN 'v' THEN 'View'
      WHEN 'm' THEN 'MaterializedView'
      WHEN 'p' THEN 'Partitioned'
      ELSE 'Ordinary'
    END AS table_kind,
    pg_catalog.pg_size_pretty(pg_catalog.pg_total_relation_size(c.oid)) AS size,
    pg_catalog.pg_total_relation_size(c.oid)::bigint AS bytes,
    COALESCE(s.n_live_tup, 0)::bigint AS live_rows_estimate,
    COALESCE(s.n_dead_tup, 0)::bigint AS dead_rows_estimate,
    c.relreplident::text AS replica_identity_raw,
    c.relrowsecurity AS rls_enabled,
    c.relforcerowsecurity AS rls_forced,
    obj_description(c.oid, 'pg_class') AS comment
  FROM pg_catalog.pg_class c
  JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
  LEFT JOIN pg_catalog.pg_stat_user_tables s ON s.relid = c.oid
  WHERE c.relkind IN ('r', 'v', 'm', 'p')
    AND n.nspname NOT LIKE 'pg_%'
    AND n.nspname != 'information_schema'
  ORDER BY n.nspname, c.relname
`,W=`
  SELECT
    a.attname AS name,
    c.relname AS table_name,
    n.nspname AS schema_name,
    c.oid::int AS table_oid,
    CASE c.relkind
      WHEN 'r' THEN 'OrdinaryTable'
      WHEN 'v' THEN 'View'
      WHEN 'm' THEN 'MaterializedView'
      WHEN 'f' THEN 'ForeignTable'
      WHEN 'p' THEN 'PartitionedTable'
      ELSE 'OrdinaryTable'
    END AS class_kind,
    pg_catalog.format_type(a.atttypid, a.atttypmod) AS type_name,
    a.atttypid::int AS type_id,
    a.attnum::int AS number,
    NOT a.attnotnull AS is_nullable,
    COALESCE(
      (SELECT true FROM pg_catalog.pg_index i
       WHERE i.indrelid = c.oid AND i.indisprimary AND a.attnum = ANY(i.indkey)),
      false
    ) AS is_primary_key,
    COALESCE(
      (SELECT true FROM pg_catalog.pg_index i
       WHERE i.indrelid = c.oid AND i.indisunique AND a.attnum = ANY(i.indkey)),
      false
    ) AS is_unique,
    pg_catalog.pg_get_expr(d.adbin, d.adrelid) AS default_expr,
    col_description(c.oid, a.attnum) AS comment,
    CASE WHEN a.atttypid = 1043 THEN information_schema._pg_char_max_length(a.atttypid, a.atttypmod) ELSE NULL END AS varchar_length
  FROM pg_catalog.pg_attribute a
  JOIN pg_catalog.pg_class c ON c.oid = a.attrelid
  JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
  LEFT JOIN pg_catalog.pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
  WHERE a.attnum > 0
    AND NOT a.attisdropped
    AND c.relkind IN ('r', 'v', 'm', 'f', 'p')
    AND n.nspname NOT LIKE 'pg_%'
    AND n.nspname != 'information_schema'
  ORDER BY n.nspname, c.relname, a.attnum
`,I=`
  SELECT
    p.oid::int AS id,
    n.nspname AS schema,
    p.proname AS name,
    pg_catalog.pg_get_function_arguments(p.oid) AS argument_types,
    pg_catalog.pg_get_function_identity_arguments(p.oid) AS identity_argument_types,
    pg_catalog.pg_get_function_result(p.oid) AS return_type,
    l.lanname AS language,
    CASE p.prokind
      WHEN 'f' THEN 'Function'
      WHEN 'a' THEN 'Aggregate'
      WHEN 'w' THEN 'Window'
      WHEN 'p' THEN 'Procedure'
      ELSE 'Function'
    END AS kind,
    CASE p.provolatile
      WHEN 'i' THEN 'Immutable'
      WHEN 's' THEN 'Stable'
      WHEN 'v' THEN 'Volatile'
      ELSE 'Volatile'
    END AS behavior,
    p.proretset AS is_set_returning_function,
    p.prosecdef AS security_definer,
    p.prosrc AS body
  FROM pg_catalog.pg_proc p
  JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
  JOIN pg_catalog.pg_language l ON l.oid = p.prolang
  WHERE n.nspname NOT LIKE 'pg_%'
    AND n.nspname != 'information_schema'
  ORDER BY n.nspname, p.proname
`;function H(t){let e=t.trim(),r="";for(;r!==e;){if(r=e,e.startsWith("Nullable(")&&e.endsWith(")")){e=e.slice(9,-1).trim();continue}if(e.startsWith("LowCardinality(")&&e.endsWith(")")){e=e.slice(15,-1).trim();continue}return e}return e}function v(t){return/^(?:U?Int(?:8|16|32|64|128|256)|Float(?:32|64)|Decimal(?:32|64|128|256)?(?:\(.+\))?)$/.test(t)}function L(t,e){if(t==null)return t;const r=H(e);if(r==="Bool"){if(typeof t=="boolean")return t;if(typeof t=="number")return t!==0;if(typeof t=="string"){if(t==="true"||t==="1")return!0;if(t==="false"||t==="0")return!1}return t}if(v(r)){if(typeof t=="number")return t;if(typeof t=="string"){const n=Number(t);return Number.isNaN(n)?t:n}}return t}function C(t){const e=t.split(`
`).filter(a=>a.trim().length>0);if(e.length<2)return[];const r=JSON.parse(e[0]),n=JSON.parse(e[1]),s=[];for(let a=2;a<e.length;a+=1){const l=JSON.parse(e[a]),_={};for(let p=0;p<r.length;p+=1)_[r[p]]=L(l[p],n[p]??"");s.push(_)}return s}function P(t){switch(t){case"d":return"Default";case"i":return"Index";case"f":return"Full";case"n":return"Nothing";default:return"Default"}}function y(t,e){const r=typeof t=="number"?t:Number(t);if(!Number.isFinite(r))throw new Error(`Invalid numeric value for ${e}: ${String(t)}`);return r}function q({schemas:t,tables:e,columns:r,functions:n}){return{schemas:t.map(s=>({id:s.id,name:s.name,owner:s.owner,allowed_creators:[],allowed_users:[],function_count:0,table_count:0,total_size:"0",view_count:0})),tables:e.map(s=>({id:s.id,schema:s.schema,name:s.name,table_kind:s.table_kind,size:s.size,bytes:y(s.bytes,"tables.bytes"),live_rows_estimate:y(s.live_rows_estimate,"tables.live_rows_estimate"),dead_rows_estimate:y(s.dead_rows_estimate,"tables.dead_rows_estimate"),replica_identity:P(s.replica_identity_raw),rls_enabled:s.rls_enabled,rls_forced:s.rls_forced,comment:s.comment??void 0})),columns:r.map(s=>({name:s.name,table_name:s.table_name,schema_name:s.schema_name,table_oid:s.table_oid,class_kind:s.class_kind,type_name:s.type_name,type_id:s.type_id,number:s.number,is_nullable:s.is_nullable,is_primary_key:s.is_primary_key,is_unique:s.is_unique,default_expr:s.default_expr??void 0,comment:s.comment??void 0,varchar_length:s.varchar_length??void 0})),functions:n.map(s=>({id:s.id,schema:s.schema,name:s.name,argument_types:s.argument_types??void 0,identity_argument_types:s.identity_argument_types??void 0,return_type:s.return_type??void 0,language:s.language,kind:s.kind,behavior:s.behavior,is_set_returning_function:s.is_set_returning_function,security_definer:s.security_definer,body:s.body??void 0,args:{args:[]}})),types:[],indexes:[],policies:[],triggers:[],roles:[],sequences:[],extensions:[]}}const d="/current.sql";let i=null,m=null;const u=(t,e)=>{const r=t instanceof Error?{message:t.message,stack:t.stack,name:t.name}:{message:String(t)};self.postMessage({type:"workerError",requestId:e,error:r})};self.addEventListener("error",t=>{u(t.error??t.message)});self.addEventListener("unhandledrejection",t=>{u(t.reason)});async function f(t,e){const r=t.credentials?{type:"password",connected:!0,username:t.credentials.username,password:t.credentials.password??""}:void 0,n=new URLSearchParams({format:"JSONCompactEachRowWithNamesAndTypes",orgId:t.orgId}),s=`${t.apiBaseUrl}/service/${t.serviceId}/runPostgres?${n.toString()}`,a=await fetch(s,{method:"POST",credentials:"include",headers:{"Content-Type":"application/json","Accept-Encoding":"gzip",authorization:`Bearer ${t.accessToken}`,"x-service-type":"postgres"},body:JSON.stringify({sql:e,database:t.database,format:"JSONCompactEachRowWithNamesAndTypes",credentials:r})});if(!a.ok)throw new Error(`Schema query failed: ${a.status} ${a.statusText}`);const l=await a.text();return C(l)}async function F(t){const[e,r,n,s]=await Promise.all([f(t,k),f(t,R),f(t,W),f(t,I)]),a=q({schemas:e,tables:r,columns:n,functions:s});i&&i.setSchema(a),self.postMessage({type:"schemaLoaded"})}function N(t){F(t).catch(e=>{const r=e instanceof Error?e.message:String(e);self.postMessage({type:"schemaError",error:{message:r}})}).finally(()=>{})}async function D(){try{i=await O(),m&&N(m),self.postMessage({type:"ready"})}catch(t){u(t)}}self.onmessage=t=>{try{if(!i&&t.data.type!=="setConnection"){u(new Error("Workspace not initialized yet"));return}const e=t.data;switch(e.type){case"setConnection":{m=e.connection,i&&N(m);break}case"refreshSchema":{m&&N(m);break}case"completion":{if(!i)throw new Error("Workspace not initialized yet");i.insertFile(d,e.statement);const r=i.complete(d,e.offset);self.postMessage({type:"completionResult",requestId:e.requestId,completions:r});break}case"lint":{if(!i)throw new Error("Workspace not initialized yet");i.insertFile(d,e.statement);const r=i.lint(d);self.postMessage({type:"lintResult",requestId:e.requestId,diagnostics:r});break}case"hover":{if(!i)throw new Error("Workspace not initialized yet");i.insertFile(d,e.statement);const r=i.hover(d,e.offset);self.postMessage({type:"hoverResult",requestId:e.requestId,content:r});break}case"splitStatements":{if(!i)throw new Error("Workspace not initialized yet");const r=i.splitStatements(e.sql);self.postMessage({type:"splitStatementsResult",requestId:e.requestId,statements:r});break}}}catch(e){const r=t.data,n=r.type==="completion"||r.type==="lint"||r.type==="hover"||r.type==="splitStatements"?r.requestId:void 0;switch(u(e,n),r.type){case"completion":self.postMessage({type:"completionResult",requestId:r.requestId,completions:[]});break;case"lint":self.postMessage({type:"lintResult",requestId:r.requestId,diagnostics:[]});break;case"hover":self.postMessage({type:"hoverResult",requestId:r.requestId,content:null});break;case"splitStatements":self.postMessage({type:"splitStatementsResult",requestId:r.requestId,statements:[]});break}}};D();var E=Object.freeze({__proto__:null});export{E as _};
