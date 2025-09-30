// js/script.js
document.addEventListener("DOMContentLoaded", () => {
  // ===== Chart =====
  const ctx = document.getElementById("attendanceChart").getContext("2d");
  /**
 * TERE-HRM Dashboard Client-Side Logic
 * Includes dynamic tab switching, the Monthly Attendance Performance Chart, and Drag & Drop functionality.
 */

  // --- Attendance Chart Logic ---

  // Helper function to convert HH:mm string to minutes from midnight
  const timeToMinutes = (time) => {
    if (!time) return 0;
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  // Mock Attendance Data for 30 Days (Type, CheckIn, CheckOut)
  const mockAttendanceData = [
    // Week 1: Mix of great and short days
    { type: 'Present', checkIn: '09:00', checkOut: '17:30' }, // 8.5h (Green)
    { type: 'Present', checkIn: '08:30', checkOut: '17:30' }, // 9.0h (Green)
    { type: 'Present', checkIn: '10:00', checkOut: '17:30' }, // 7.5h (Yellow)
    { type: 'Present', checkIn: '09:00', checkOut: '17:45' }, // 8.75h (Green)
    { type: 'Present', checkIn: '09:15', checkOut: '17:45' }, // 8.5h (Green)
    { type: 'Rest Day', checkIn: null, checkOut: null },      // (Blue)
    { type: 'Rest Day', checkIn: null, checkOut: null },      // (Blue)

    // Week 2: Absences and Leave
    { type: 'Present', checkIn: '09:00', checkOut: '16:30' }, // 7.5h (Yellow)
    { type: 'Absent', checkIn: null, checkOut: null },        // (Red)
    { type: 'Present', checkIn: '09:00', checkOut: '16:00' }, // 7.0h (Yellow)
    { type: 'Leave', checkIn: null, checkOut: null },         // (Blue)
    { type: 'Present', checkIn: '08:30', checkOut: '17:00' }, // 8.5h (Green)
    { type: 'Rest Day', checkIn: null, checkOut: null },      // (Blue)
    { type: 'Rest Day', checkIn: null, checkOut: null },      // (Blue)

    // Week 3: Mostly Normal
    { type: 'Present', checkIn: '09:00', checkOut: '18:00' }, // 9.0h (Green)
    { type: 'Present', checkIn: '09:00', checkOut: '17:00' }, // 8.0h (Green)
    { type: 'Present', checkIn: '09:00', checkOut: '16:45' }, // 7.75h (Yellow)
    { type: 'Absent', checkIn: null, checkOut: null },        // (Red)
    { type: 'Present', checkIn: '09:00', checkOut: '17:15' }, // 8.25h (Green)
    { type: 'Rest Day', checkIn: null, checkOut: null },      // (Blue)
    { type: 'Rest Day', checkIn: null, checkOut: null },      // (Blue)

    // Week 4: Final Mix
    { type: 'Present', checkIn: '08:45', checkOut: '18:00' }, // 9.25h (Green)
    { type: 'Present', checkIn: '09:00', checkOut: '16:00' }, // 7.0h (Yellow)
    { type: 'Leave', checkIn: null, checkOut: null },         // (Blue)
    { type: 'Present', checkIn: '09:30', checkOut: '17:30' }, // 8.0h (Green)
    { type: 'Absent', checkIn: null, checkOut: null },        // (Red)
    { type: 'Rest Day', checkIn: null, checkOut: null },      // (Blue)
    { type: 'Rest Day', checkIn: null, checkOut: null },      // (Blue)

    // Days 29, 30
    { type: 'Present', checkIn: '09:00', checkOut: '17:00' }, // 8.0h (Green)
    { type: 'Present', checkIn: '09:00', checkOut: '16:45' }, // 7.75h (Yellow)
  ];

  /**
   * Calculates attendance data for the chart, including color and average time.
   */
  const generateChartData = (data) => {
    const chartLabels = [];
    const chartData = [];
    const chartColors = [];
    let totalHours = 0;
    const specialValue = 10; // Value for Leave/Rest Day to stand out on the chart

    data.slice(0, 30).forEach((day, index) => {
      const dayNumber = (index + 1).toString().padStart(2, '0');
      chartLabels.push(dayNumber);

      if (day.type === 'Present') {
        const checkInMins = timeToMinutes(day.checkIn);
        const checkOutMins = timeToMinutes(day.checkOut);
        const durationMins = checkOutMins - checkInMins;
        const durationHours = durationMins / 60;

        const displayHours = Math.max(0, durationHours);
        chartData.push(displayHours);
        totalHours += displayHours;

        if (durationHours >= 8.0) {
          chartColors.push('#2aa54f'); // Green: >= 8 hours
        } else if (durationHours > 0) {
          chartColors.push('#ffc107'); // Yellow: 0 < hours < 8
        } else {
          chartColors.push('#d83b13'); // Red: 0 hours
        }
      } else if (day.type === 'Absent') {
        chartData.push(0);
        chartColors.push('#d83b13'); // Red: Absent (0 hours)
      } else {
        // Leave or Rest Day
        chartData.push(specialValue);
        chartColors.push('#007bff'); // Blue: Leave/Rest Day
      }
    });

    const presentDays = data.filter(d => d.type === 'Present' && (timeToMinutes(d.checkOut) - timeToMinutes(d.checkIn)) / 60 > 0).length;
    const averageDailyTime = presentDays > 0 ? totalHours / presentDays : 0;

    return { labels: chartLabels, data: chartData, colors: chartColors, averageDailyTime };
  };

  /**
   * Initializes the Chart.js Bar Chart.
   */
  const initAttendanceChart = () => {
    const ctx = document.getElementById('attendanceChart').getContext('2d');
    if (!ctx) return; // Exit if the canvas is not found

    const { labels, data, colors, averageDailyTime } = generateChartData(mockAttendanceData);

    // Update Average Time Display
    const avgDisplay = document.getElementById('avg-time-value');
    if (avgDisplay) {
      const color = averageDailyTime >= 8 ? '#2aa54f' : '#ffc107';
      avgDisplay.textContent = `${averageDailyTime.toFixed(2)} hours`;
      avgDisplay.style.color = color;
    }

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: "Hours Worked",
          data: data,
          backgroundColor: colors,
          borderRadius: 6,
          barPercentage: 0.9,
          categoryPercentage: 0.8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (context) => `Day ${context[0].label}`,
              label: (context) => {
                const value = context.parsed.y;
                if (value === 10) return 'Status: Leave or Rest Day (Blue)';
                if (value === 0) return 'Status: Absent (Red)';
                return `Hours: ${value.toFixed(2)}h (${value >= 8 ? 'Target Met (Green)' : 'Short (Yellow)'})`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 10.5,
            ticks: {
              stepSize: 2,
              callback: (value) => {
                if (value === 8) return "8h Target";
                if (value === 10) return "Leave/Rest Day";
                if (value > 0) return `${value}h`;
                if (value === 0) return "Absent";
                return "";
              }
            },
            title: {
              display: true,
              text: 'Hours Worked'
            }
          },
          x: {
            grid: { display: false },
            title: {
              display: true,
              text: 'Day of the Month'
            }
          }
        }
      }
    });
  };

  // --- Tab Switching Logic (Consolidated) ---
  const setupTabs = () => {
    const tabContainers = document.querySelectorAll('.tab-card');
    tabContainers.forEach(container => {
      const tabButtons = container.querySelectorAll('.tab-btn');
      tabButtons.forEach(button => {
        button.addEventListener('click', () => {
          const targetTabId = button.getAttribute('data-tab');

          // Deactivate all siblings
          container.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
          container.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

          // Activate clicked button and corresponding content
          button.classList.add('active');
          const targetContent = container.querySelector(`#${targetTabId}`);
          if (targetContent) {
            targetContent.classList.add('active');
          }
        });
      });
    });
  };

  // --- Drag & Drop Logic ---
  const setupDragAndDrop = () => {
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
  };


  // --- Initialization ---
  document.addEventListener('DOMContentLoaded', () => {
    setupTabs();
    initAttendanceChart();
    setupDragAndDrop();
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
