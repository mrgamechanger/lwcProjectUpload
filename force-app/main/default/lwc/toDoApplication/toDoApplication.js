import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class TodoApplication extends LightningElement {
    @track tasks = [];
    @track newTaskName = '';
    @track newTaskDuration = { minutes: 0 };
    @track newCategory = '';
    @track newPriority = '';

    taskIdCounter = 1;

    categoryOptions = [
        { label: 'Work', value: 'Work',  },
        { label: 'Personal', value: 'Personal', },
        { label: 'Health', value: 'Health',  },
    ];

    priorityOptions = [
        { label: 'High', value: 'High' },
        { label: 'Medium', value: 'Medium' },
        { label: 'Low', value: 'Low' },
    ];

    get pendingTasks() {
        return this.tasks.filter(task => !task.completed);
    }

    get completedTasks() {
        return this.tasks.filter(task => task.completed);
    }

    get pendingTotalDuration() {
        return this.calculateTotalDuration(this.pendingTasks);
    }

    get completedTotalDuration() {
        return this.calculateTotalDuration(this.completedTasks);
    }

    handleTaskNameChange(event) {
        this.newTaskName = event.target.value;
    }

    handleTaskDurationChange(event) {
        const minutes = parseInt(event.target.value, 10);
        this.newTaskDuration = {
            minutes: isNaN(minutes) ? 0 : minutes
        };
    }

    handleCategoryChange(event) {
        this.newCategory = event.target.value;
    }

    handlePriorityChange(event) {
        this.newPriority = event.target.value;
    }

    handleAddTask() {
        if (this.newTaskName && this.newTaskDuration.minutes > 0 && this.newCategory && this.newPriority) {
            this.tasks = [
                ...this.tasks,
                {
                    id: this.taskIdCounter++,
                    name: this.newTaskName,
                    duration: this.newTaskDuration.minutes,
                    category: this.newCategory,
                    priority: this.newPriority,
                    completed: false,
                }
            ];

            this.showToast('Success', 'Task added successfully!', 'success');
            this.resetForm();
        } else {
            this.showToast('Error', 'Please fill out all fields correctly before adding a task.', 'error');
        }
    }

    handleCompleteTask(event) {
        const taskId = parseInt(event.target.dataset.id, 10);
        this.tasks = this.tasks.map(task =>
            task.id === taskId ? { ...task, completed: true } : task
        );
    }

    handleUndoTask(event) {
        const taskId = parseInt(event.target.dataset.id, 10);
        this.tasks = this.tasks.map(task =>
            task.id === taskId ? { ...task, completed: false } : task
        );
    }

    handleDeleteTask(event) {
        const taskId = parseInt(event.target.dataset.id, 10);
        this.tasks = this.tasks.filter(task => task.id !== taskId);
    }

    calculateTotalDuration(taskList) {
        const totalMinutes = taskList.reduce((total, task) => total + task.duration, 0);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours} hours ${minutes} minutes`;
    }

    resetForm() {
        this.newTaskName = '';
        this.newTaskDuration = { minutes: 0 };
        this.newCategory = '';
        this.newPriority = '';
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title,
            message,
            variant
        });
        this.dispatchEvent(event);
    }
}