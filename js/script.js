document.addEventListener("DOMContentLoaded", () => {
  // ===== Chart =====
  const ctx = document.getElementById("attendanceChart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"],
      datasets: [{
        label: "Attendance",
        data: [1, 0.8, 0.85, 0.93, 1, 0.95, 0.5, 0.9, 0.98, 1],
        backgroundColor: [
          "#3d5a80","#d83b13","#693f34","#2aa54f",
          "#8eacd3","#bbe916","#1b0096","#cf2379",
          "#e0fbfc","#e7700e"
        ],
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 1.2,
          ticks: {
            stepSize: 0.25,
            callback: (value) => {
              if (value === 1) return "Present";
              if (value === 0.5) return "Half Day";
              if (value === 0) return "Absent/Missing";
              return "";
            }
          }
        },
        x: { grid: { display: false } }
      },
      plugins: { legend: { display: false } }
    }
  });

  // ===== Tabs =====
  const tabButtons = document.querySelectorAll(".tab-btn");
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;

      // deactivate all
      btn.parentElement.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      // hide sibling contents
      const card = btn.closest(".tab-card");
      card.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
      card.querySelector(`#${target}`).classList.add("active");
    });
  });

  // ===== Drag & Drop =====
  const draggableCards = document.querySelectorAll(".summary-card, .tab-card, .attendance-details");
  draggableCards.forEach(card => {
    card.setAttribute("draggable", true);

    card.addEventListener("dragstart", e => {
      e.dataTransfer.setData("text/plain", card.id);
      card.classList.add("dragging");
    });

    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
    });
  });

  const dropZones = document.querySelectorAll(".main-content, .grid-2, .profile-section");
  dropZones.forEach(zone => {
    zone.addEventListener("dragover", e => {
      e.preventDefault();
      const draggingCard = document.querySelector(".dragging");
      const afterElement = getDragAfterElement(zone, e.clientY);
      if (afterElement == null) {
        zone.appendChild(draggingCard);
      } else {
        zone.insertBefore(draggingCard, afterElement);
      }
    });
  });

  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll(".summary-card:not(.dragging), .tab-card:not(.dragging), .attendance-details:not(.dragging)")];
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }
});
