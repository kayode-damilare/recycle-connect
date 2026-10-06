const monthYear = document.getElementById("monthyear");
const daysContainer = document.getElementById("days");
const prevMonthBtn = document.getElementById("prev-month");
const nextMonthBtn = document.getElementById("next-month");

let currentDate = new Date();

const renderCalendar = () => {
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const firstDay = new Date(year, month, 1).getDate();
  const lastDay = new Date(year, month + 1, 0).getDate();

  console.log({ year }, { month }, { firstDay }, { lastDay });
  daysContainer.innerHTML = "";
  monthYear.textContent = `${currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  })} `;
  for (let i = 1; i <= firstDay; i++) {
    daysContainer.innerHTML += `<div class="text-center w-[30px] h-[30px] flex items-center justify-center text-gray-500 hover:rounded-full hover:bg-[#087a55]"></div>`;
  }

  for (let i = 1; i <= lastDay; i++) {
    const today = new Date();
    const isToday =
      i === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear();
    daysContainer.innerHTML += `<div class="text-center
     w-[30px] h-[30px] flex items-center justify-center
      ${
        isToday
          ? "bg-[#087a55] rounded-full text-white"
          : "text-gray-500 hover:rounded-full hover:bg-[#087a55]"
      }">
        ${i}</div>`;
  }
};

renderCalendar();

prevMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});
nextMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});
