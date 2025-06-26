let pages = []
let currentPageId = null
let searchQuery = ''
let tagFilter = ''
let onHomePage = true

function generateId() {
  return Date.now()
}

function renderPageList(filteredPages = pages) {
  const list = document.getElementById('page-list')
  list.innerHTML = ''
  filteredPages.forEach((page) => {
    const link = document.createElement('div')
    const isActive = !onHomePage && page.id === currentPageId
    link.className = 'page-link' + (isActive ? ' active' : '')
    link.innerText = page.title || 'Anotação sem título'
    link.onclick = () => {
      onHomePage = false
      loadPage(page.id)
    }
    list.appendChild(link)
  })
}

function loadPage(id) {
  onHomePage = false
  currentPageId = id
  const page = pages.find((p) => p.id === id)
  renderPageForm(page)
  searchQuery = ''
  tagFilter = ''
  document.getElementById('search-input').value = ''
  renderPageList()
}

function loadHome() {
  onHomePage = true
  currentPageId = null
  searchQuery = ''
  tagFilter = ''
  document.getElementById('search-input').value = ''

  const content = document.getElementById('content-area')

  // Adiciona a classe homepage para centralizar o conteúdo
  content.classList.add('homepage')

  content.innerHTML = `
    <h1>Bem-vindo ao Sabiá</h1>
    <p>Este é um sistema simples para gerenciar suas anotações pessoais.</p>
    <p>Você pode criar, editar e salvar notas com títulos, tags, conteúdos e anexos.</p>
    <p>Use a barra lateral para navegar entre suas anotações, pesquisar por texto ou filtrar por tags.</p>
    <p>Clique em <strong>+ Nova anotação</strong> para começar a criar suas notas agora mesmo.</p>
    <p>Os anexos podem ser adicionados em cada anotação, e ficam disponíveis para download.</p>
    <p>Esperamos que o Sabiá ajude a organizar suas ideias e projetos!</p>
  `
  renderPageList()
}

function renderPageForm(page) {
  const content = document.getElementById('content-area')

  // Remove a classe homepage ao mostrar uma anotação
  content.classList.remove('homepage')

  const attachmentsHtml = (page.files || []).map((f, i) => `
    <div>
      <a href="${URL.createObjectURL(f)}" download="${f.name}" title="Clique para baixar">
        📎 ${f.name} (${Math.round(f.size / 1024)} KB)
      </a>
    </div>
  `).join('')

  content.innerHTML = `
    <div class="fields-row">
      <div class="field">
        <label for="tags">Tags</label>
        <input id="tags" value="${page.tags || ''}" placeholder="Ex: trabalho, ideias..." />
      </div>

      <button class="save-btn" onclick="savePage()">Salvar</button>
    </div>

    <div class="title-field">
      <label for="title">Título</label>
      <input id="title" value="${page.title || ''}" placeholder="Título da nota..." />
    </div>

    <div class="content-field" style="flex:1; display:flex; flex-direction:column;">
      <label for="content">Conteúdo</label>
      <textarea id="content" placeholder="Escreva aqui sua nota...">${page.content || ''}</textarea>
    </div>

    <div class="attachments-field">
      <label for="attachments">Anexar arquivos</label>
      <input type="file" id="attachments" multiple />
      <div id="attachment-preview" style="margin-top: 12px;">
        ${attachmentsHtml}
      </div>
    </div>
  `
}

function addPage() {
  const newPage = {
    id: generateId(),
    title: '',
    tags: '',
    content: '',
    files: []
  }
  pages.push(newPage)
  loadPage(newPage.id)
}

function savePage() {
  if (currentPageId === null) return
  const page = pages.find((p) => p.id === currentPageId)

  page.title = document.getElementById('title').value
  page.tags = document.getElementById('tags').value
  page.content = document.getElementById('content').value

  const filesInput = document.getElementById('attachments')
  if (filesInput && filesInput.files.length > 0) {
    const newFiles = Array.from(filesInput.files)
    page.files = [...(page.files || []), ...newFiles]
    filesInput.value = ''
  }

  renderPageList(filterPages())
  renderPageForm(page)
}

function filterPages() {
  let filtered = pages

  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    filtered = filtered.filter((p) =>
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.content && p.content.toLowerCase().includes(q))
    )
  }

  if (tagFilter) {
    const tag = tagFilter.toLowerCase()
    filtered = filtered.filter((p) => {
      if (!p.tags) return false
      const tags = p.tags.split(',').map(t => t.trim().toLowerCase())
      return tags.includes(tag)
    })
  }

  return filtered
}

document.getElementById('search-input').addEventListener('input', (e) => {
  searchQuery = e.target.value.trim()
  tagFilter = ''
  renderPageList(filterPages())
})

const modalOverlay = document.getElementById('modal-overlay')
const tagListElement = document.getElementById('tag-list')
const openTagsBtn = document.getElementById('open-tags-btn')
const closeModalBtn = document.getElementById('close-modal-btn')

openTagsBtn.onclick = () => {
  const allTags = new Set()
  pages.forEach(p => {
    if (p.tags) {
      p.tags.split(',').forEach(t => allTags.add(t.trim()))
    }
  })

  tagListElement.innerHTML = ''
  allTags.forEach(tag => {
    const li = document.createElement('li')
    li.textContent = tag
    li.onclick = () => {
      tagFilter = tag
      searchQuery = ''
      document.getElementById('search-input').value = ''
      modalOverlay.style.display = 'none'
      renderPageList(filterPages())
    }
    tagListElement.appendChild(li)
  })

  modalOverlay.style.display = 'flex'
}

closeModalBtn.onclick = () => {
  modalOverlay.style.display = 'none'
}

window.onclick = function(event) {
  if (event.target === modalOverlay) {
    modalOverlay.style.display = 'none'
  }
}

// Evento para clicar no logo e carregar a home
document.querySelector('.logo-and-title').onclick = () => {
  loadHome()
}

// Inicializa já mostrando a página inicial
loadHome()
