import { templates, sectionTitles, defaultResume } from './templates.js';

const form = document.querySelector('#resume-form');
const preview = document.querySelector('#resume-preview');
const picker = document.querySelector('#template-picker');
const storageKey = 'curriculo-em-foco-v1';
let saved = readSaved();
let selectedTemplate = templates.some(item => item.id === saved.template) ? saved.template : templates[0].id;
let resume = { ...structuredClone(defaultResume), ...(saved.resume || {}) };

function readSaved() {
  try { return JSON.parse(localStorage.getItem(storageKey)) || {}; } catch { return {}; }
}
function persist() { localStorage.setItem(storageKey, JSON.stringify({ template: selectedTemplate, resume })); }
function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
function field(label, path, value, placeholder = '', type = 'text') {
  return `<label class="field"><span>${label}</span><input type="${type}" data-path="${path}" value="${escapeHtml(value)}" placeholder="${placeholder}" ${type === 'email' ? 'autocomplete="email"' : ''}></label>`;
}
function textarea(label, path, value, placeholder = '') {
  return `<label class="field"><span>${label}</span><textarea data-path="${path}" rows="3" placeholder="${placeholder}">${escapeHtml(value)}</textarea></label>`;
}
function renderPicker() {
  picker.innerHTML = templates.map(template => `<button type="button" class="template-card ${selectedTemplate === template.id ? 'is-selected' : ''}" data-template="${template.id}" aria-pressed="${selectedTemplate === template.id}"><span class="template-icon" aria-hidden="true"><i></i><i></i><i></i></span><span class="template-meta"><strong>${template.name}</strong><small>${template.type} · ${template.description}</small></span><span class="template-check" aria-hidden="true">✓</span></button>`).join('');
}
function renderForm() {
  form.innerHTML = `
    <fieldset class="form-section"><legend><span class="section-number">01</span> Dados pessoais</legend>
      <div class="field-grid">${field('Nome completo', 'fullName', resume.fullName, 'Como gostaria de ser chamado?')}${field('Celular', 'phone', resume.phone, '(00) 00000-0000', 'tel')}${field('E-mail', 'email', resume.email, 'voce@email.com', 'email')}${field('Data de nascimento', 'birthDate', resume.birthDate, '', 'text')}${field('Estado civil', 'maritalStatus', resume.maritalStatus, 'Opcional')}${field('Transporte', 'transport', resume.transport, 'Ex.: próprio, público')}${field('Cidade', 'city', resume.city, 'Sua cidade')}${field('Bairro', 'neighborhood', resume.neighborhood, 'Seu bairro')}${field('Estado / UF', 'state', resume.state, 'Ex.: MS')}</div>
    </fieldset>
    <fieldset class="form-section"><legend><span class="section-number">02</span> Objetivo</legend>${textarea('O que busca profissionalmente?', 'objective', resume.objective, 'Conte em poucas linhas o tipo de oportunidade que procura.')}</fieldset>
    <fieldset class="form-section"><legend><span class="section-number">03</span> Formação acadêmica</legend>${textarea('Cursos e escolaridade', 'education', resume.education, 'Ex.: Ensino médio completo · Escola Estadual · 2024')}</fieldset>
    <fieldset class="form-section"><legend><span class="section-number">04</span> Experiências profissionais</legend><div id="experience-list">${resume.experience.map((entry, index) => `<div class="repeat-card"><div class="repeat-heading"><strong>Experiência ${index + 1}</strong>${repeatRemove(index, 'experience')}</div><div class="field-grid">${field('Empresa', `experience.${index}.company`, entry.company, 'Nome da empresa')}${field('Nome conhecido (opcional)', `experience.${index}.tradeName`, entry.tradeName, 'Nome fantasia')}${field('Função exercida', `experience.${index}.role`, entry.role, 'Seu cargo ou atividade')}${field('Contrato (opcional)', `experience.${index}.contract`, entry.contract, 'Ex.: estágio')}${field('Período', `experience.${index}.period`, entry.period, 'Ex.: jan/2024 – atual')}${field('Telefone (opcional)', `experience.${index}.phone`, entry.phone, '(00) 0000-0000', 'tel')}</div></div>`).join('')}</div><button type="button" class="add-button" data-add="experience">＋ Adicionar experiência</button></fieldset>
    <fieldset class="form-section"><legend><span class="section-number">05</span> Qualificações</legend><div id="qualification-list">${resume.qualifications.map((entry, index) => `<div class="repeat-card"><div class="repeat-heading"><strong>Qualificação ${index + 1}</strong>${repeatRemove(index, 'qualifications')}</div><div class="field-grid">${field('Curso / qualificação', `qualifications.${index}.name`, entry.name, 'Nome do curso')}${field('Instituição ou tipo', `qualifications.${index}.kind`, entry.kind, 'Ex.: curso livre')}${field('Carga horária', `qualifications.${index}.hours`, entry.hours, 'Ex.: 40 horas')}${field('Conclusão', `qualifications.${index}.completion`, entry.completion, 'Ex.: 2025')}</div></div>`).join('')}</div><button type="button" class="add-button" data-add="qualifications">＋ Adicionar qualificação</button></fieldset>
    ${listSection('knowledge', '06', 'Conhecimentos específicos', resume.knowledge, 'Ex.: Pacote Office')}
    ${listSection('strengths', '07', 'Habilidades pessoais', resume.strengths, 'Ex.: Comunicação')}
  `;
}
function repeatRemove(index, key) { return `<button type="button" class="remove-button" data-remove="${key}" data-index="${index}" aria-label="Remover item">Remover</button>`; }
function listSection(key, number, title, items, placeholder) {
  return `<fieldset class="form-section"><legend><span class="section-number">${number}</span> ${title}</legend><div id="${key}-list">${items.map((item, index) => `<div class="list-row">${field(`${title.slice(0, -1)} ${index + 1}`, `${key}.${index}`, item, placeholder)}${repeatRemove(index, key)}</div>`).join('')}</div><button type="button" class="add-button" data-add="${key}">＋ Adicionar item</button></fieldset>`;
}
function getPath(path) { return path.split('.').reduce((obj, key) => obj?.[key], resume); }
function setPath(path, value) {
  const parts = path.split('.');
  const last = parts.pop();
  const target = parts.reduce((obj, key) => obj[key], resume);
  target[last] = value;
}
function hasContent(value) { return typeof value === 'string' ? value.trim().length > 0 : Object.values(value).some(item => String(item || '').trim()); }
function sectionContent(key) {
  if (key === 'personal') return `<div class="resume-personal"><h1>${escapeHtml(resume.fullName || 'Seu nome completo')}</h1><div class="contact-grid">${[['Celular', resume.phone], ['E-mail', resume.email], ['Data de nascimento', resume.birthDate], ['Estado civil', resume.maritalStatus], ['Transporte', resume.transport], ['Cidade', resume.city], ['Bairro', resume.neighborhood], ['UF', resume.state]].filter(([, value]) => value?.trim()).map(([label, value]) => `<p><strong>${label}:</strong> ${label === 'E-mail' ? `<a href="mailto:${escapeHtml(value)}">${escapeHtml(value)}</a>` : escapeHtml(value)}</p>`).join('')}</div></div>`;
  if (key === 'objective' || key === 'education') return resume[key].trim() ? `<p class="resume-paragraph">${escapeHtml(resume[key]).replace(/\n/g, '<br>')}</p>` : '';
  if (key === 'experience') return resume.experience.filter(hasContent).map(item => `<div class="resume-entry"><h3>${escapeHtml(item.company || 'Empresa')}${item.tradeName ? ` <span>— ${escapeHtml(item.tradeName)}</span>` : ''}</h3>${[['Contrato', item.contract], ['Função exercida', item.role], ['Período', item.period], ['Telefone', item.phone]].filter(([, value]) => value?.trim()).map(([label, value]) => `<p><strong>${label}:</strong> ${escapeHtml(value)}</p>`).join('')}</div>`).join('');
  if (key === 'qualifications') return resume.qualifications.filter(hasContent).map(item => `<div class="resume-entry"><p><strong>${escapeHtml(item.name)}</strong>${item.kind ? ` — ${escapeHtml(item.kind)}` : ''}</p>${[['Carga horária', item.hours], ['Conclusão', item.completion]].filter(([, value]) => value?.trim()).map(([label, value]) => `<p class="resume-detail">${label}: ${escapeHtml(value)}</p>`).join('')}</div>`).join('');
  if (key === 'knowledge' || key === 'strengths') {
    const items = resume[key].filter(item => item.trim());
    return items.length ? `<ul>${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : '';
  }
  return '';
}
function renderPreview() {
  const template = templates.find(item => item.id === selectedTemplate) || templates[0];
  preview.className = `resume-paper ${template.id}`;
  preview.innerHTML = template.order.map(key => {
    const content = sectionContent(key);
    if (!content) return '';
    if (key === 'personal') return content;
    return `<section class="resume-section"><h2>${sectionTitles[key]}</h2>${content}</section>`;
  }).join('');
}

picker.addEventListener('click', event => {
  const button = event.target.closest('[data-template]');
  if (!button) return;
  selectedTemplate = button.dataset.template;
  renderPicker(); renderPreview(); persist();
});
form.addEventListener('input', event => {
  if (!event.target.matches('[data-path]')) return;
  setPath(event.target.dataset.path, event.target.value);
  renderPreview(); persist();
});
form.addEventListener('click', event => {
  const add = event.target.closest('[data-add]');
  if (add) {
    const key = add.dataset.add;
    const blank = key === 'experience' ? { company: '', tradeName: '', role: '', contract: '', period: '', phone: '' } : key === 'qualifications' ? { name: '', kind: '', hours: '', completion: '' } : '';
    resume[key].push(blank); renderForm(); renderPreview(); persist(); return;
  }
  const remove = event.target.closest('[data-remove]');
  if (remove) {
    const list = resume[remove.dataset.remove];
    if (list.length > 1) list.splice(Number(remove.dataset.index), 1);
    renderForm(); renderPreview(); persist();
  }
});
document.querySelector('#print-button').addEventListener('click', () => window.print());
document.querySelector('#year').textContent = new Date().getFullYear();
renderPicker(); renderForm(); renderPreview();
