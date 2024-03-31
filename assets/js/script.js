const taskName = $("#taskName");
const taskDate = $("#taskDate");
const taskDescription = $("#taskDescription");
const createTaskButton = $(".create-task");
const msgDiv = $(".msg");

// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Display a message if there are form errors
function displayMessage(type, message) {
  msgDiv.text(message);
  msgDiv.addClass(type);
}

// Todo: create a function to generate a unique task id
function generateTaskId() {
  return nextId++;
}

// Todo: create a function to create a task card
function createTaskCard(task) {
  const dueDate = dayjs(task.dueDate);
  // Calculate the difference in days between today and the due date
  const daysDifference = dueDate.diff(dayjs(), "day");

  // Determine background color based on due date proximity
  let bgColor = "";
  if (daysDifference < 0) {
    // Task is overdue
    bgColor = "bg-danger";
  } else if (daysDifference <= 2) {
    // Task is within 2 days
    bgColor = "bg-warning";
  } else {
    // Task is not within 2 days
    bgColor = "bg-light";
  }

  //   Check to see if the task is done or not
  if (task.status === "done") {
    bgColor += " bg-light";
  }

  //   create task card
  const taskCard = `
    <div class="draggable task-card card mb-3 ${bgColor}" data-task-id="${task.id}">
      <div class="card-body">
        <h5 class="card-title">${task.title}</h5>
        <p class="card-text">${task.description}</p>
        <p class="card-text">Due Date: ${task.dueDate}</p>
        <button type="button" class="btn btn-danger delete-task">Delete</button>
      </div>
    </div>
  `;

  return taskCard;
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
  // Clear the columns of their tasks so that when rerendered there are no duplicates
  $("#todo-cards, #in-progress-cards, #done-cards").empty();

  //   Create a task card for each task in the list
  taskList.forEach((task) => {
    const taskCard = createTaskCard(task);
    if (task.status === "todo") {
      $("#todo-cards").append(taskCard);
    } else if (task.status === "in-progress") {
      $("#in-progress-cards").append(taskCard);
    } else if (task.status === "done") {
      $("#done-cards").append(taskCard);
    }
  });

  //   listens to see if on of the tasks is deleted
  $(".delete-task").on("click", handleDeleteTask);

  //   makes the tasks draggable
  $(".draggable").draggable({
    revert: "invalid",
    stack: ".draggable",
  });
}

// Todo: create a function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();

  //   gets the values from the form
  const title = taskName.val();
  const description = taskDescription.val();
  const dueDate = taskDate.val();

  //   checks to see if any of the inputs are blank
  if (title === "" || description === "" || dueDate === "") {
    displayMessage("text-danger", "Please fill in all fields.");
    return;
  }

  //   creates a task id
  const task = {
    id: generateTaskId(),
    title: title,
    dueDate: dueDate,
    description: description,
    status: "todo",
  };

  //   pushes the task to the list of tasks and saves them to storage
  taskList.push(task);
  localStorage.setItem("tasks", JSON.stringify(taskList));
  localStorage.setItem("nextId", nextId);

  $("#formModal").modal("hide");

  taskName.val("");
  taskDescription.val("");
  taskDate.val("");

  renderTaskList();
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event) {
  event.preventDefault();
  event.stopPropagation();

  //   finds the task id that is clicked and
  //   gets a list of all the filtered tasks and sets that list to storage
  const taskId = $(this).closest(".task-card").data("task-id");
  taskList = taskList.filter((task) => task.id !== taskId);
  localStorage.setItem("tasks", JSON.stringify(taskList));

  renderTaskList();
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  event.stopPropagation();
  event.preventDefault();

  //   finds the column the task is in and the id of the task
  const laneId = $(this).attr("id");
  const cardId = ui.draggable.data("task-id");

  //   sets the status for whiched column it was dropped in
  let newStatus = "";
  if (laneId === "todo-cards") {
    newStatus = "todo";
  } else if (laneId === "in-progress-cards") {
    newStatus = "in-progress";
  } else if (laneId === "done-cards") {
    newStatus = "done";
  } else {
    newStatus = "todo";
  }

  //   finds the task and sets the new status for the task
  const taskIndex = taskList.findIndex((task) => task.id === cardId);
  if (taskIndex !== -1) {
    taskList[taskIndex].status = newStatus;
    localStorage.setItem("tasks", JSON.stringify(taskList));
  }

  //   detatches this task from the column it was in and appends it to the one it was dropped in
  ui.draggable.detach().appendTo($(this));

  renderTaskList();
}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  renderTaskList();

  createTaskButton.on("click", handleAddTask);

  $(function () {
    $("#taskDate").datepicker({
      changeMonth: true,
      changeYear: true,
    });
  });

  $(".droppable").droppable({
    accept: ".draggable",
    drop: handleDrop,
  });
});
