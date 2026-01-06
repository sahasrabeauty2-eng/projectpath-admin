// ========================================
// PROJECT PATH - ADMIN PROJECT MANAGEMENT
// ========================================

let editingProjectId = null;

// Initialize projects page
document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    setupFormHandlers();
    setupThumbnailPreview();
    setupOptionalFields();
});

// Setup form handlers
function setupFormHandlers() {
    const form = document.getElementById('projectForm');
    const cancelButton = document.getElementById('cancelButton');

    form.addEventListener('submit', handleProjectSubmit);
    cancelButton.addEventListener('click', cancelEdit);
}

// Setup thumbnail preview
function setupThumbnailPreview() {
    const thumbnailInput = document.getElementById('projectThumbnail');
    const preview = document.getElementById('thumbnailPreview');

    thumbnailInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.innerHTML = `<img src="${e.target.result}" style="max-width: 200px; border-radius: 0.5rem; border: 1px solid var(--border-color);">`;
            };
            reader.readAsDataURL(file);
        }
    });
}

// Setup optional fields (circuit diagram, product links, additional links)
function setupOptionalFields() {
    // Circuit Diagram Toggle
    document.getElementById('toggleCircuitDiagram').addEventListener('click', () => {
        const section = document.getElementById('circuitDiagramSection');
        const button = document.getElementById('toggleCircuitDiagram');
        if (section.style.display === 'none') {
            section.style.display = 'block';
            button.textContent = '➖ Remove Circuit Diagram';
        } else {
            section.style.display = 'none';
            button.textContent = '➕ Add Circuit Diagram (Optional)';
            document.getElementById('circuitDiagram').value = '';
            document.getElementById('circuitPreview').innerHTML = '';
        }
    });

    // Circuit Diagram Preview
    document.getElementById('circuitDiagram').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('circuitPreview').innerHTML =
                    `<img src="${e.target.result}" style="max-width: 300px; border-radius: 0.5rem; border: 1px solid var(--border-color);">`;
            };
            reader.readAsDataURL(file);
        }
    });

    // Product Links Toggle
    document.getElementById('toggleProductLinks').addEventListener('click', () => {
        const section = document.getElementById('productLinksSection');
        const button = document.getElementById('toggleProductLinks');
        if (section.style.display === 'none') {
            section.style.display = 'block';
            button.textContent = '➖ Remove Product Links';
            if (document.getElementById('productLinksList').children.length === 0) {
                addProductLinkField();
            }
        } else {
            section.style.display = 'none';
            button.textContent = '➕ Add Product Links (Optional)';
            document.getElementById('productLinksList').innerHTML = '';
        }
    });

    // Additional Links Toggle
    document.getElementById('toggleAdditionalLinks').addEventListener('click', () => {
        const section = document.getElementById('additionalLinksSection');
        const button = document.getElementById('toggleAdditionalLinks');
        if (section.style.display === 'none') {
            section.style.display = 'block';
            button.textContent = '➖ Remove Additional Links';
            if (document.getElementById('additionalLinksList').children.length === 0) {
                addAdditionalLinkField();
            }
        } else {
            section.style.display = 'none';
            button.textContent = '➕ Add Additional Links (Optional)';
            document.getElementById('additionalLinksList').innerHTML = '';
        }
    });

    // Add Product Link Button
    document.getElementById('addProductLink').addEventListener('click', addProductLinkField);

    // Add Additional Link Button
    document.getElementById('addAdditionalLink').addEventListener('click', addAdditionalLinkField);
}

// Add product link field
function addProductLinkField() {
    const container = document.getElementById('productLinksList');
    const index = container.children.length;

    const fieldHTML = `
    <div class="product-link-item" style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 0.5rem; margin-bottom: 0.5rem;" data-index="${index}">
      <input type="text" class="form-input product-link-name" placeholder="Product Name" />
      <input type="url" class="form-input product-link-url" placeholder="https://..." />
      <button type="button" class="btn btn-icon btn-danger" onclick="removeProductLink(${index})" title="Remove">
        🗑️
      </button>
    </div>
  `;

    container.insertAdjacentHTML('beforeend', fieldHTML);
}

// Remove product link field
function removeProductLink(index) {
    const item = document.querySelector(`.product-link-item[data-index="${index}"]`);
    if (item) item.remove();
}

// Add additional link field
function addAdditionalLinkField() {
    const container = document.getElementById('additionalLinksList');
    const index = container.children.length;

    const fieldHTML = `
    <div class="additional-link-item" style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 0.5rem; margin-bottom: 0.5rem;" data-index="${index}">
      <input type="text" class="form-input additional-link-label" placeholder="Link Label (e.g., Code)" />
      <input type="url" class="form-input additional-link-url" placeholder="https://..." />
      <button type="button" class="btn btn-icon btn-danger" onclick="removeAdditionalLink(${index})" title="Remove">
        🗑️
      </button>
    </div>
  `;

    container.insertAdjacentHTML('beforeend', fieldHTML);
}

// Remove additional link field
function removeAdditionalLink(index) {
    const item = document.querySelector(`.additional-link-item[data-index="${index}"]`);
    if (item) item.remove();
}

// Handle project form submission
async function handleProjectSubmit(e) {
    e.preventDefault();

    const submitButton = document.getElementById('submitButton');
    submitButton.disabled = true;
    submitButton.textContent = editingProjectId ? 'Updating...' : 'Adding...';

    try {
        const title = document.getElementById('projectTitle').value.trim();
        const description = document.getElementById('projectDescription').value.trim();
        const youtubeLink = document.getElementById('projectYoutubeUrl').value.trim();
        const thumbnailFile = document.getElementById('projectThumbnail').files[0];

        let thumbnail = '';

        // Upload thumbnail if new file selected
        if (thumbnailFile) {
            thumbnail = await uploadThumbnail(thumbnailFile);
        } else if (editingProjectId) {
            // Keep existing thumbnail when editing
            const projectSnapshot = await database.ref(`projects/${editingProjectId}`).once('value');
            const project = projectSnapshot.val();
            thumbnail = project.thumbnail;
        }

        // Handle optional circuit diagram
        let circuitDiagramUrl = '';
        const circuitDiagramFile = document.getElementById('circuitDiagram').files[0];
        if (circuitDiagramFile) {
            circuitDiagramUrl = await uploadCircuitDiagram(circuitDiagramFile);
        } else if (editingProjectId) {
            const projectSnapshot = await database.ref(`projects/${editingProjectId}`).once('value');
            const project = projectSnapshot.val();
            circuitDiagramUrl = project.circuitDiagramUrl || '';
        }

        // Collect product links
        const productLinks = [];
        const productLinkItems = document.querySelectorAll('.product-link-item');
        productLinkItems.forEach(item => {
            const name = item.querySelector('.product-link-name').value.trim();
            const url = item.querySelector('.product-link-url').value.trim();
            if (name && url) {
                productLinks.push({ name, url });
            }
        });

        // Collect additional links
        const additionalLinks = [];
        const additionalLinkItems = document.querySelectorAll('.additional-link-item');
        additionalLinkItems.forEach(item => {
            const label = item.querySelector('.additional-link-label').value.trim();
            const url = item.querySelector('.additional-link-url').value.trim();
            if (label && url) {
                additionalLinks.push({ label, url });
            }
        });

        // Prepare project data
        const projectData = {
            title,
            description,
            shortDescription: description.length > 100 ? description.substring(0, 97) + '...' : description,
            youtubeLink,
            thumbnail,
            likes: editingProjectId ? undefined : 0, // Don't reset likes when editing
            updatedAt: Date.now()
        };

        // Add optional fields only if they exist
        if (circuitDiagramUrl) {
            projectData.circuitDiagramUrl = circuitDiagramUrl;
        }

        if (productLinks.length > 0) {
            projectData.productLinks = productLinks;
        }

        if (additionalLinks.length > 0) {
            projectData.additionalLinks = additionalLinks;
        }

        if (!editingProjectId) {
            projectData.createdAt = Date.now();
        }

        // Save to Firebase
        if (editingProjectId) {
            await database.ref(`projects/${editingProjectId}`).update(projectData);
            alert('Project updated successfully!');
        } else {
            const newProjectRef = database.ref('projects').push();
            await newProjectRef.set(projectData);
            alert('Project added successfully!');
        }

        // Reset form and reload
        resetForm();
        loadProjects();

    } catch (error) {
        console.error('Error saving project:', error);
        alert('Error saving project: ' + error.message);
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = editingProjectId ? '✏️ Update Project' : '➕ Add Project';
    }
}

// Upload thumbnail to Firebase Storage
async function uploadThumbnail(file) {
    const timestamp = Date.now();
    const filename = `thumbnails/${timestamp}_${file.name}`;
    const storageRef = storage.ref(filename);

    // Upload file
    await storageRef.put(file);

    // Get download URL
    const downloadUrl = await storageRef.getDownloadURL();
    return downloadUrl;
}

// Upload circuit diagram to Firebase Storage
async function uploadCircuitDiagram(file) {
    const timestamp = Date.now();
    const filename = `circuit-diagrams/${timestamp}_${file.name}`;
    const storageRef = storage.ref(filename);

    // Upload file
    await storageRef.put(file);

    // Get download URL
    const downloadUrl = await storageRef.getDownloadURL();
    return downloadUrl;
}

// Load all projects
function loadProjects() {
    const tbody = document.getElementById('projectsTableBody');

    database.ref('projects').on('value', (snapshot) => {
        const projects = snapshot.val();

        if (!projects) {
            tbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; color: var(--text-secondary); padding: 2rem;">
            No projects yet. Add your first project above!
          </td>
        </tr>
      `;
            return;
        }

        // Convert to array and sort by creation date
        const projectsArray = Object.entries(projects).map(([id, data]) => ({
            id,
            ...data
        })).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        // Render projects
        tbody.innerHTML = projectsArray.map(project => `
      <tr>
        <td>
          <img src="${project.thumbnail}" alt="${project.title}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 0.375rem;">
        </td>
        <td>${project.title}</td>
        <td>${project.likes || 0}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn-icon btn-secondary" onclick="editProject('${project.id}')" title="Edit">
              ✏️
            </button>
            <button class="btn btn-icon btn-danger" onclick="deleteProject('${project.id}', '${project.title}')" title="Delete">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `).join('');
    });
}

// Edit project
async function editProject(projectId) {
    editingProjectId = projectId;

    try {
        const snapshot = await database.ref(`projects/${projectId}`).once('value');
        const project = snapshot.val();

        // Fill form
        document.getElementById('projectTitle').value = project.title;
        document.getElementById('projectDescription').value = project.description;
        document.getElementById('projectYoutubeUrl').value = project.youtubeLink || '';

        // Show thumbnail preview
        document.getElementById('thumbnailPreview').innerHTML = `
      <img src="${project.thumbnail}" style="max-width: 200px; border-radius: 0.5rem; border: 1px solid var(--border-color);">
      <p style="color: var(--text-secondary); font-size: 0.875rem; margin-top: 0.5rem;">Select a new image to replace, or leave blank to keep current thumbnail</p>
    `;

        // Update UI
        document.getElementById('projectThumbnail').removeAttribute('required');
        document.getElementById('submitButton').textContent = '✏️ Update Project';
        document.getElementById('cancelButton').style.display = 'inline-flex';

        // Scroll to form
        document.getElementById('projectForm').scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (error) {
        console.error('Error loading project:', error);
        alert('Error loading project: ' + error.message);
    }
}

// Delete project
async function deleteProject(projectId, projectTitle) {
    if (!confirm(`Are you sure you want to delete "${projectTitle}"?\n\nThis action cannot be undone.`)) {
        return;
    }

    try {
        // Get project to delete thumbnail from storage
        const snapshot = await database.ref(`projects/${projectId}`).once('value');
        const project = snapshot.val();

        // Delete from database
        await database.ref(`projects/${projectId}`).remove();

        // Try to delete thumbnail from storage (optional - may fail if not exists)
        try {
            if (project.thumbnail) {
                const thumbnailRef = storage.refFromURL(project.thumbnail);
                await thumbnailRef.delete();
            }
        } catch (storageError) {
            console.warn('Could not delete thumbnail from storage:', storageError);
        }

        alert('Project deleted successfully!');

    } catch (error) {
        console.error('Error deleting project:', error);
        alert('Error deleting project: ' + error.message);
    }
}

// Cancel edit mode
function cancelEdit() {
    resetForm();
}

// Reset form
function resetForm() {
    editingProjectId = null;
    document.getElementById('projectForm').reset();
    document.getElementById('thumbnailPreview').innerHTML = '';
    document.getElementById('projectThumbnail').setAttribute('required', '');
    document.getElementById('submitButton').textContent = '➕ Add Project';
    document.getElementById('cancelButton').style.display = 'none';

    // Reset optional fields
    document.getElementById('circuitDiagramSection').style.display = 'none';
    document.getElementById('toggleCircuitDiagram').textContent = '➕ Add Circuit Diagram (Optional)';
    document.getElementById('circuitPreview').innerHTML = '';

    document.getElementById('productLinksSection').style.display = 'none';
    document.getElementById('toggleProductLinks').textContent = '➕ Add Product Links (Optional)';
    document.getElementById('productLinksList').innerHTML = '';

    document.getElementById('additionalLinksSection').style.display = 'none';
    document.getElementById('toggleAdditionalLinks').textContent = '➕ Add Additional Links (Optional)';
    document.getElementById('additionalLinksList').innerHTML = '';
}
