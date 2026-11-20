// The portfolio calls the original sales store with SQLite running in the tab.
// sql.js statements use bind/step, while node:sqlite offers get/all/run.
function newSaleId() {
  if (globalThis.crypto.randomUUID) return globalThis.crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, b => b.toString(16).padStart(2,'0')).join('');
  return [hex.slice(0,8),hex.slice(8,12),hex.slice(12,16),hex.slice(16,20),hex.slice(20)].join('-');
}
function adaptDatabase(database) {
  let inTransaction = false;
  return {
    get isTransaction() { return inTransaction; },
    exec(sql) {
      database.run(sql);
      if (sql.startsWith('BEGIN')) inTransaction = true;
      if (sql === 'COMMIT' || sql === 'ROLLBACK') inTransaction = false;
    },
    prepare(sql) {
      function rows(params) {
        const statement = database.prepare(sql);
        try {
          statement.bind(params);
          const result = [];
          while (statement.step()) result.push(statement.getAsObject());
          return result;
        } finally { statement.free(); }
      }
      return {
        get: (...args) => rows(args)[0],
        all: (...args) => rows(args),
        run(...args) {
          database.run(sql,args);
          return {changes:database.getRowsModified()};
        }
      };
    }
  };
}
(async () => {
  const el = id => document.getElementById(id);
  try {
    const SQL = await initSqlJs();
    let database, store, db, previous, lastSaleKey, cursor;
    const normal = [{productId:'notebook',quantity:2},{productId:'pen',quantity:1}];
    const options = {
      sale: normal,
      large: [{productId:'notebook',quantity:1},{productId:'pen',quantity:99}],
      conflict: [{productId:'notebook',quantity:1}]
    };
    function preview() {
      const scenario = el('scenario').value;
      const key = scenario==='conflict' ? lastSaleKey : 'venta-'+String(cursor).padStart(3,'0');
      const items = options[scenario];
      el('key').textContent=key;
      el('request').textContent=JSON.stringify({items},null,2);
      return {key,items,scenario};
    }
    function metrics() {
      const row=db.prepare('SELECT count(*) AS count, coalesce(sum(amount_cents),0) AS cash FROM cash_movements').get();
      el('count').textContent=db.prepare('SELECT count(*) AS count FROM sales').get().count;
      el('cash').textContent=(row.cash/100).toLocaleString('es-AR',{style:'currency',currency:'ARS'});
      el('inventory').replaceChildren(...store.listProducts().map(product=>{
        const li=document.createElement('li');li.textContent=product.name+' · '+product.stock+' u.';return li;
      }));
    }
    function reset() {
      if(database) database.close();
      database=new SQL.Database();db=adaptDatabase(database);store=createSalesStore(db);
      cursor=1;previous=null;lastSaleKey=null;el('scenario').value='sale';el('conflict').disabled=true;el('replay').disabled=true;
      el('send').disabled=false;el('reset').disabled=false;el('status').textContent='Lista';
      el('response').textContent='Esperando una solicitud.';preview();metrics();
    }
    function send(request) {
      previous = request;
      el('replay').disabled = false;
      try {
        const result=store.registerSale(request.key,request.items);
        el('status').textContent=result.replayed?'200 OK · Venta recuperada':'201 Created · Venta registrada';
        el('response').textContent=JSON.stringify({sale:result.sale},null,2);
        lastSaleKey = request.key;
        el('conflict').disabled = false;
      } catch(error) {
        el('status').textContent=error instanceof SaleError?String(error.status)+' · Solicitud rechazada':'Error local';
        el('response').textContent=JSON.stringify({error:error.message},null,2);
      }
      metrics();
    }
    // Keep the submitted request in view alongside its response. A new click
    // generates a fresh key, while the replay action retains the previous key.
    el('scenario').addEventListener('change',preview);
    el('send').addEventListener('click',()=>{
      const request=preview();send(request);if(el('scenario').value!=='conflict') cursor++;
    });
    el('replay').addEventListener('click',()=>{
      el('scenario').value=previous.scenario;el('key').textContent=previous.key;
      el('request').textContent=JSON.stringify({items:previous.items},null,2);send(previous);
    });
    el('reset').addEventListener('click',reset);
    reset();
  } catch(error) {
    el('status').textContent='No se pudo iniciar SQLite';
    el('response').textContent='Volvé a abrir la demo con la carpeta vendor incluida. '+error.message;
  }
})();
