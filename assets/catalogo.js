(() => {
  if (location.protocol === 'http:' || location.protocol === 'https:') {
    const cv = document.getElementById('enlace-cv');
    cv.download = 'Alesandro-Casanova-CV.pdf';
    cv.textContent = 'Descargar CV';
  }
  const projects = window.proyectos;
  const catalog = document.getElementById('catalogo');
  const filters = document.getElementById('filtros');
  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }
  function coverFor(project) {
    const cover = element(project.demo ? 'a' : 'div','cover');
    if (project.demo) {
      cover.href = project.demo;
      cover.setAttribute('aria-label','Ver '+project.titulo);
    }
    if (project.imagen) {
      cover.classList.add('image-cover');
      const img = element('img'); img.src = project.imagen; img.alt = ''; img.loading = 'lazy';
      cover.append(img);
    } else if (project.muestra) {
      cover.classList.add('api-cover');
      const window = element('div','term');
      window.setAttribute('aria-hidden','true');
      const bar = element('div','term-top');
      bar.append(element('i'),element('i'),element('i'),element('span','',project.muestra.archivo));
      const code = element('div','term-code');
      project.muestra.lineas.forEach((line, i) => code.append(element(i === 0 ? 'b' : i === 3 ? 'strong' : 'span','',line),element('br')));
      window.append(bar,code); cover.append(window);
    } else {
      cover.classList.add('plain-cover');
      cover.append(element('span','',project.titulo));
    }
    if (project.demo) cover.append(element('span','round-arrow','↗'));
    return cover;
  }
  function card(project) {
    const article = element('article'), body = element('div','project-body');
    body.append(element('p','overline',project.area.toUpperCase()+(project.estado?' · '+project.estado.toUpperCase():'')),element('h3','',project.titulo),element('p','',project.resumen));
    const tags = element('ul','tags');
    (project.tecnologias || []).forEach(tag => tags.append(element('li','',tag)));
    const links = element('div','card-links');
    if (project.demo) {
      const demo = element('a', 'demo-link', (project.accion || 'Probar demo') + ' →');
      demo.href = project.demo;
      links.append(demo);
    }
    if(project.codigo) {
      const source=element('a','textlink',project.codigo.endsWith('.zip')?'Código fuente ↓':'Ver código ↗');
      source.href=project.codigo;
      if(project.codigo.endsWith('.zip')) source.download='';
      links.append(source);
    }
    body.append(tags,links); article.append(coverFor(project),body); return article;
  }
  function filterBy(area) {
    const visible=area===null?projects:projects.filter(p=>p.area===area);
    catalog.replaceChildren(...visible.map(card));
    [...filters.children].forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.area || null)===area)));
    document.getElementById('resultados').textContent=visible.length+(visible.length===1?' proyecto visible':' proyectos visibles');
  }
  for(const area of [null,...new Set(projects.map(p=>p.area))]) {
    const button=element('button','',area || 'Todos');
    if(area) button.dataset.area=area;
    button.type='button';button.addEventListener('click',()=>filterBy(area));filters.append(button);
  }
  filterBy(null);
})();
