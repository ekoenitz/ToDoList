const initDocElems = () => {
    return {
        todoList: document.getElementById('todolist'),
        taskTemplate: document.getElementById('task-template').firstElementChild,
        editTemplate: document.getElementById('edit-task-template').firstElementChild,
        newList: document.getElementById('newlist'),
        formCount: 0
    }
};

var docElems;

const init = () => {
    // tasks load asynchronously with rest of init()
    loadTasks(); 

    // convenience object with references to key DOM objects and the form counter
    docElems = initDocElems();

    // attach event handlers to controls in right sidebar
    // to controls
    document.querySelector('.controls')
        .addEventListener('click', (event) => {
            if (event.target.closest('INPUT.controlbtn') && 
                event.target.closest('INPUT.controlbtn').value == "New task") {
                handleNewTask(event)
            };
            if (event.target.closest('INPUT.controlbtn') &&
                event.target.closest('INPUT.controlbtn').value == "Filter") {
                  var filter = document.querySelector('input[name="filter"]:checked').value;
                  handleFilter(event, filter);
                }
        });
    //
    // to new tasks being edited
    document.querySelector('#newlist')
        .addEventListener('click', (event) => {
            
            // you can remove the diagnostic console.log and alert statements
            console.log("event:");
            console.log(event);
            // alert("Check browser console for console.log messages");

            if (event.target.closest('INPUT.editbtn')) {
                handleNewTaskSave(event)
            };

            if (event.target.closest('INPUT.deletebtn')) {
                handleNewTaskCancel(event)
            };
            
        });

    document.querySelector('#todolist')
        .addEventListener('click', (event) => {
            if (event.target.closest('INPUT.status')) {
                console.log("task checked? " + event.target.checked);
                status = (event.target.checked ? "done" : "tbd");
                console.log('status: ' + status);
                if(!event.path[3].classList.contains("todoForm")) {

                  taskid = event.target.closest('SECTION.todoitem').children[0].value;
                  console.log('taskid: ' + taskid);
                
                  postData('/status/update', { 'taskid': taskid, 'status': status })
                      .then(response => {
                          console.log("before reading body of postData response:")
                          console.log(response);

                          message = response.json();

                          console.log("after reading body of postData response:")
                          console.log(response);
                          console.log("message read from response body: ")
                          console.log(message);

                          return message;
                      })
                      .then(reply => {
                          console.log("reply that resolved promise:")
                          console.log(reply);
                          
                          if (reply.error) {
                              alert("Server Error: " + reply.error)
                          }
                      })
                      // catch errors not caught by server-side application 
                      .catch(error => console.log(error))
              };
            }
            // addition eventListeners go here for clicks of buttons
            // Edit, Delete
            // Save and Cancel (these on the form created click on Edit)
          if (event.target.closest('INPUT.editbtn')) {
            if(event.target.closest('section.todoitem').classList.contains('todoForm')) {
              handleEditTaskSave(event);
            }
            else {
              handleEditTask(event);
            }
          }
          if (event.target.closest('INPUT.deletebtn')) {
            if(event.target.closest('section.todoitem').classList.contains('todoForm')) {
              handleEditTaskCancel(event);
            }
            else {
              handleTaskDelete(event);
            }
          }
        });
};   

const loadTasks = () => {
    getTasks("all")
        .then(rsp => {
            payload = rsp.json();
            return payload
        })
        .then(tasks => {
            console.log("resolving promise in loadTasks response:")
            console.log(tasks);
            createTaskElements(tasks);
        })
};

const getTasks = (filter) => {
    return fetch("/tasks/" + filter, {
                // set headers to let server know format of 
                // request and response bodies
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-type': 'application/json'
                }
            })
}

const putTask = (task) => {
    console.log("from putTask, task:");
    console.log(task);
    return fetch('/task/new', {

        // represent JS object as a string
        body: JSON.stringify(task),

        // set headers to let server know format of 
        // request and response bodies
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json'
        },

        // in the ReST spirit method should be PUT
        // but bottle does not support HTTP verb PUT
        method: 'POST'
    })
}

//Wrote this.  Sorta.
const replaceTask = (task) => {
    console.log("from replaceTask, task:");
    console.log(task);
    return fetch("/task/update", {

        // represent JS object as a string
        body: JSON.stringify(task),

        // set headers to let server know format of 
        // request and response bodies
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json'
        },

        // in the ReST spirit method should be PUT
        // but bottle does not support HTTP verb PUT
        method: 'POST'
    })
}

const saveDueDate = (dueDate) => {
  return fetch("/task/duedate", {

        // represent JS object as a string
        body: JSON.stringify(dueDate),

        // set headers to let server know format of 
        // request and response bodies
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json'
        },

        // in the ReST spirit method should be PUT
        // but bottle does not support HTTP verb PUT
        method: 'POST'
    })
}
//End stuff I wrote.

const postTask = (task) => {
    console.log("from postTask, task:");
    console.log(task);
    return postData('/task/update/', task)
}

function postData(url, jsondata) {
    return fetch(url, {
        body: JSON.stringify(jsondata),
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json'
        },
        method: 'POST'
    })
}

// functions for building and manipulating DOM

const createTaskElements = (taskListData) => {
    console.log("from createTaskElements: creating task elements");
    taskListData.forEach(createAndAppendTaskElement)
}

const createTaskElement = (task) => {
    // cloneNode(true) makes a deep clone (as opposed to shallow clone)
    var taskel = docElems.taskTemplate.cloneNode(true);
    updateTaskElement(task, taskel);
    return taskel
};

const updateTaskElement = (task, taskel) => {
    console.log(task);
    setTaskId(taskel, task.taskid);
    setTaskDescription(taskel, task.taskdescription);
    setTaskDueDate(taskel, task.duedate);
    setTaskPostDate(taskel, task.postdate);
    setStatus(taskel, task.status);
}

const appendTaskElement = (taskel) => {
        docElems.todoList.appendChild(taskel);
}

// poor (wo)man's function composition
const createAndAppendTaskElement = (taskel) => {
    appendTaskElement(createTaskElement(taskel))
}

const setTaskId = (taskel, taskid) => {
    var  taskidEl = taskel.querySelector('.taskid');
    taskidEl.value = taskid;
};

const getTaskId = (taskel) => {
    var taskidEl = taskel.querySelector('.taskid');
    return taskidEl.value
}

const setTaskDescription = (taskel, taskdescription) => {
    var taskDescriptionEl = taskel.querySelector('.taskdescription');
    taskDescriptionEl.innerHTML = taskdescription;
}

// Also wrote this.
const setTaskFormDescription = (taskel, taskdescription) => {
    var taskDescriptionEl = taskel.querySelector('.taskdescription');
    taskDescriptionEl.firstElementChild.innerHTML = taskdescription;
}

const setTaskDueDate = (taskel, taskduedate) => {
  var taskDueDateEl = taskel.querySelector('.duedate');
  var today = getCurrentDate();
  taskDueDateEl.value = taskduedate;
  taskDueDateEl.setAttribute('min', today);
}

const setTaskPostDate = (taskel, taskpostdate) => {
  var taskPostDateEl = taskel.querySelector('.postdate');
  taskPostDateEl.innerHTML = taskpostdate;
}

const getTaskDueDate = (taskel) => {
    var taskDueDateEl = taskel.querySelector('.duedate');
    return taskDueDateEl.value
}

const getTaskPostDate = (taskel) => {
    var taskPostDateEl = taskel.querySelector('.postdate');
    return taskPostDateEl.innerHTML
}

// End stuff I wrote.

const getTaskFormDescription = (taskel) => {
    var taskDescriptionEl = taskel.querySelector('.taskdescription');
    return taskDescriptionEl.firstElementChild.value
}

const getTaskDescription = (taskel) => {
    var taskDescriptionEl = taskel.querySelector('.taskdescription');
    return taskDescriptionEl.innerHTML
}

const setStatus = (taskel, status) => {
    var taskStatusEl = taskel.querySelector('.status');
    if (status === "done") {
        taskStatusEl.checked = true;
    }
}

const getStatus = (taskel) => {
    var taskStatusEl = taskel.querySelector('.status');
    return (taskStatusEl.checked ? "done" : "tbd")
}

const editNewTask = () => {
    var taskFormEl = docElems.editTemplate.cloneNode(true);
    setFormId(taskFormEl);
    // Mine
    var taskDueDateEl = taskFormEl.querySelector('.duedate');
    var today = getCurrentDate();
    taskDueDateEl.setAttribute('min', today);
    // End mine
    docElems.newList.appendChild(taskFormEl);
}

const setFormId = (taskFormEl) => {

    // create unique (within DOM) form id
    docElems.formCount += 1;
    formid = "form-" + docElems.formCount

    // set form id in form elements and form
    taskFormEl.querySelector('.taskid').form = formid;
    taskFormEl.querySelector('.taskdescription').firstElementChild.form = formid;
    taskFormEl.querySelector('.status').form = formid;
    taskFormEl.querySelector('.editbtn').form = formid;
    taskFormEl.querySelector('FORM').id = formid;
}

// New Task Handlers

const handleNewTask = (event) => {
    editNewTask();
}

const handleNewTaskSave = (event) => {
    var taskFormEl = event.target.closest('section.todoitem');
    task = {
        taskdescription: getTaskFormDescription(taskFormEl),
        taskduedate: getTaskDueDate(taskFormEl),
        taskpostdate: getCurrentDate(),
        status: getStatus(taskFormEl)
    };
    putTask(task)
        .then(rsp => {
            console.log("before reading putTask response body");
            console.log(rsp);
            payload = rsp.json();
            console.log("after reading putTask response body");
            console.log(rsp);
            console.log("payload:");
            console.log(payload);
            return payload
        })
        .then(task => {
            console.log("task resolving promise:")
            console.log(task);
            createTaskElement(task);
            taskFormEl.remove();
        })
}

const handleNewTaskCancel = (event) => {
    var taskFormEl = event.target.closest('section.todoitem');
    taskFormEl.remove()
}

/* My Code */

// Filtering
const handleFilter = (event, filter) => {
    getTasks(filter)
        .then(rsp => {
            payload = rsp.json();
            return payload
        })
        .then(tasks => {
            console.log("resolving promise in loadTasks response:")
            console.log(tasks);
            document.getElementById("todolist").innerHTML = '';
            createTaskElements(tasks);
        })
}

// Due Date Change
// (Yes this is just a copy of the handleEditTaskSave code, sue me.
const handleDueDateChange = (dueDateEl) => {
  var taskEl = dueDateEl.parentElement;
    task = {
        taskID: getTaskId(taskEl),
        taskdescription: getTaskDescription(taskEl),
        taskduedate: getTaskDueDate(taskEl),
        taskpostdate: getTaskPostDate(taskEl),
        status: getStatus(taskEl)
    };
    console.log(task);
    replaceTask(task)
        .then(rsp => {
            console.log("before reading putTask response body");
            console.log(rsp);
            payload = rsp.json();
            console.log("after reading putTask response body");
            console.log(rsp);
            console.log("payload:");
            console.log(payload);
            return payload
        })
        .then(task => {
            console.log("task resolving promise:")
            console.log(task);
            createTaskElement(task);
        })
}

// Task Editing Functions
const makeTaskEditForm = (taskFormEl, taskInfo, taskDueDate, taskPostDate, taskStatus) => {
    editForm = docElems.editTemplate.cloneNode(true);
    setTaskFormDescription(editForm, taskInfo);
    setTaskDueDate(editForm, taskDueDate);
    setTaskPostDate(editForm, taskPostDate);
    // setStatus doesn't work
    setStatus(editForm, taskInfo);
    setFormId(editForm);
    console.log(editForm);
    return editForm.innerHTML;
}

const getRidOfEditForm = () => {
  return docElems.taskTemplate.innerHTML;
}

// Task Event Handlers
const handleEditTask = (event) => {
    var taskFormEl = event.target.closest('section.todoitem');
    var taskID = getTaskId(taskFormEl);
    var taskInfo = getTaskDescription(taskFormEl);
    var taskDueDate = getTaskDueDate(taskFormEl);
    var taskPostDate = getTaskPostDate(taskFormEl);
    var taskStatus = getStatus(taskFormEl);
    // Have to work with innerHTML because of reference reassigning oddities.
    taskFormEl.innerHTML = makeTaskEditForm(taskFormEl, taskInfo, taskDueDate, taskPostDate, taskStatus);
    taskFormEl.classList.add('todoForm');
    taskFormEl.innerHTML +=
      '<p class="oldTask" style="display: none;">' +
      taskInfo +
      '</p>' +
      '<p class="oldStatus" style="display: none;">' +
      taskStatus +
      '</p>' +
      '<p class="id" style="display: none;">' +
      taskID +
      '</p>' +
      '<p class="oldDue" style="display: none;">' +
      taskDueDate +
      '</p>';
    //These need to be done here AND in the other function to take; I don't even know anymore.
    setStatus(taskFormEl, taskStatus);
    setTaskDueDate(taskFormEl, taskDueDate);
}

const handleEditTaskSave = (event) => {
    var taskFormEl = event.target.closest('section.todoitem');
    task = {
        taskID: parseInt(taskFormEl.getElementsByClassName('id')[0].innerHTML),
        taskdescription: getTaskFormDescription(taskFormEl),
        taskduedate: getTaskDueDate(taskFormEl),
        taskpostdate: getTaskPostDate(taskFormEl),
        status: getStatus(taskFormEl)
    };
    replaceTask(task)
        .then(rsp => {
            console.log("before reading putTask response body");
            console.log(rsp);
            payload = rsp.json();
            console.log("after reading putTask response body");
            console.log(rsp);
            console.log("payload:");
            console.log(payload);
            return payload
        })
        .then(task => {
            console.log("task resolving promise:")
            console.log(task);
            createTaskElement(task);
            taskFormEl.remove();
        })
}

const handleEditTaskCancel = (event) => {
    var taskFormEl = event.target.closest('section.todoitem');
    var taskID = getTaskId(taskFormEl);
    var taskInfo = taskFormEl.getElementsByClassName('oldTask')[0].innerHTML;
    var taskDueDate = taskFormEl.getElementsByClassName('oldDue')[0].innerHTML;
    var taskPostDate = getTaskPostDate(taskFormEl);
    var taskStatus = taskFormEl.getElementsByClassName('oldStatus')[0].innerHTML;
    
    taskFormEl.innerHTML = getRidOfEditForm();
    taskFormEl.classList.remove('todoForm');
    setTaskId(taskFormEl, taskID);
    setTaskDescription(taskFormEl, taskInfo);
    setTaskDueDate(taskFormEl, taskDueDate);
    setTaskPostDate(taskFormEl, taskPostDate);
    setStatus(taskFormEl, taskStatus);
}

const handleTaskDelete = (event) => {
  var taskFormEl = event.target.closest('section.todoitem');
  var taskID = getTaskId(taskFormEl);
  taskFormEl.style.display = "none";
  fetch("/task/delete/" + taskID, {

        // represent JS object as a string
        body: JSON.stringify(taskID),

        // set headers to let server know format of 
        // request and response bodies
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json'
        },

        // in the ReST spirit method should be PUT
        // but bottle does not support HTTP verb PUT
        method: 'POST'
    });
}

// Sorting
//...this may be a blatant repurposing of my HW2 sort code, which wasn't even good the first time.
const shouldSwap = (taskA, taskB, sortBy, isAscending) => {
  var shouldSwap = false;
  if (sortBy === "dd") {
    if ((isAscending && getTaskDueDate(taskA) > getTaskDueDate(taskB)) ||
        (!isAscending && getTaskDueDate(taskA) < getTaskDueDate(taskB))) {
      shouldSwap = true;  
    }
  }
  else {
    if ((isAscending && getTaskPostDate(taskA) > getTaskPostDate(taskB)) ||
        (!isAscending && getTaskPostDate(taskA) < getTaskPostDate(taskB))) {
      shouldSwap = true;  
    }
  }
  return shouldSwap;
}

const swap = (taskA, taskB) => {
  var tempHTML = taskA.innerHTML;
  var tempID = getTaskId(taskA);
  var tempDesc = getTaskDescription(taskA);
  var tempDueDate = getTaskDueDate(taskA);
  var tempPostDate = getTaskPostDate(taskA);
  var tempStatus = getStatus(taskA);
  
  taskA.innerHTML = taskB.innerHTML;
  setTaskId(taskA, getTaskId(taskB));
  setTaskDescription(taskA, getTaskDescription(taskB));
  setTaskDueDate(taskA, getTaskDueDate(taskB));
  setTaskPostDate(taskA, getTaskPostDate(taskB));
  setStatus(taskA, getStatus(taskB));
  
  taskB.innerHTML = tempHTML;
  setTaskId(taskB, tempID);
  setTaskDescription(taskB, tempDesc);
  setTaskDueDate(taskB, tempDueDate);
  setTaskPostDate(taskB, tempPostDate);
  setStatus(taskB, tempStatus);
}

const dumbSort = (tasks, sortBy, isAscending) => {
  for (var i = 2; i < tasks.length; i++) {
    for (var j = i+1; j < tasks.length; j++) {
      if (shouldSwap(tasks[i], tasks[j], sortBy, isAscending)) {
        swap(tasks[i], tasks[j]);
      }
    }
  }
}

const noEditForms = (tasks) => {
  var noEditForms = true;
  for (var i = 2; i < tasks.length && noEditForms; i++) {
    noEditForms = !tasks[i].classList.contains("todoForm");
  }
  return noEditForms
}

const sort = (howToSort) => {
  
  if (howToSort != "none") {
    tasks = document.getElementsByClassName('todoitem');
    if (noEditForms(tasks)) {
      var options = howToSort.split(',');
      dumbSort(tasks, options[0], options[1]=="Asc");
    }
    else {
      alert("Please close all edit forms before sorting");
    }
  }
}

/***********
Note: The getCurrentDate code is not mine.
It comes from the answer found on this page:
https://stackoverflow.com/questions/1531093/how-do-i-get-the-current-date-in-javascript
************/
function getCurrentDate() {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();

  if(dd<10) {
      dd = '0'+dd
  } 

  if(mm<10) {
      mm = '0'+mm
  } 
  return yyyy + '-' + mm + '-' + dd;
}

init();


