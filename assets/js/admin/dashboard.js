const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.view-section');
const viewTitle = document.getElementById('current-view-title');

navItems.forEach(item => {
  item.addEventListener('click', () => {
    // Update active nav
    navItems.forEach(nav => nav.classList.remove('active'));
    item.classList.add('active');
    
    // Update title
    viewTitle.textContent = item.textContent;
    
    // Show view
    const target = item.dataset.target;
    views.forEach(view => {
      view.classList.remove('active');
      if (view.id === `view-${target}`) {
        view.classList.add('active');
      }
    });
  });
});

// Basic modal handling
document.querySelectorAll('.close-modal').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const targetId = e.currentTarget.dataset.dismiss;
    document.getElementById(targetId).classList.remove('active');
  });
});
