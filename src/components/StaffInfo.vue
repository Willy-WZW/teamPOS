<script>
export default {
    data() {
        return {
            employees: [
                { id: 'A001', name: '王小明', phone: '0910110001', password: '************', email: 'wangming@email.com', role: '內場' },
                { id: 'A002', name: '李小花', phone: '0910220002', password: '************', email: 'lixiaohua@email.com', role: '外場' },
            ],
            newEmployee: {
                id: '',
                name: '',
                phone: '',
                password: '',
                email: '',
                role: '',
            },
            searchQuery: '',
            editingId: null,
            showAddRow: false,
            currentPage: 1,
            pageSize: 5,
        };
    },
    computed: {
        //模糊搜尋
        filteredEmployees() {
            const query = this.searchQuery.toLowerCase();
            return this.employees.filter(employee =>
                employee.name.toLowerCase().includes(query) ||
                employee.id.toLowerCase().includes(query)
            );
        },
        paginatedEmployees() {
            const start = (this.currentPage - 1) * this.pageSize;
            return this.filteredEmployees.slice(start, start + this.pageSize);
        },
        nextEmployeeId() {
            const maxId = Math.max(...this.employees.map(e => parseInt(e.id.slice(1))), 0);
            return `A${String(maxId + 1).padStart(3, '0')}`;
        },
        totalPages() {
            return Math.ceil(this.filteredEmployees.length / this.pageSize);
        }
    },
    methods: {
        toggleAddEmployee() {
            if (this.showAddRow) {
                this.addEmployee();
            } else {
                this.showAddRow = true;
            }
        },
        addEmployee() {
            if (this.showAddRow) {
                this.newEmployee.id = this.nextEmployeeId;
                this.employees.push({ ...this.newEmployee });
                this.resetNewEmployee();
            }
        },
        resetNewEmployee() {
            this.newEmployee = { id: '', name: '', phone: '', password: '', email: '', role: '' };
            this.showAddRow = false;
        },
        deleteEmployee(id) {
            this.employees = this.employees.filter(emp => emp.id !== id);
        },
        startEditing(id) {
            this.editingId = id;
        },
        saveEditing() {
            this.editingId = null;
        },
        cancelEditing() {
            this.editingId = null;
        },
        changePage(page) {
            this.currentPage = page;
        }
    }
};
</script>

<template>
    <div class="employee-management-container">
        <div class="employee-management">
            <h2>員工管理</h2>

            <div class="search-bar">
                <input v-model="searchQuery" placeholder="搜尋姓名或員工編號" />
            </div>

            <div class="employee-table">
                <table>
                    <thead>
                        <tr>
                            <th>員工編號</th>
                            <th>姓名</th>
                            <th>電話</th>
                            <th>密碼</th>
                            <th>email</th>
                            <th>授權</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="employee in paginatedEmployees" :key="employee.id">
                            <td>{{ employee.id }}</td>
                            <td>
                                <div class="cell-content">
                                    <input v-if="editingId === employee.id" v-model="employee.name"
                                        class="edit-input" />
                                    <span v-else>{{ employee.name }}</span>
                                </div>
                            </td>
                            <td>
                                <div class="cell-content">
                                    <input v-if="editingId === employee.id" v-model="employee.phone"
                                        class="edit-input" />
                                    <span v-else>{{ employee.phone }}</span>
                                </div>
                            </td>
                            <td>
                                <div class="cell-content">
                                    <input v-if="editingId === employee.id" v-model="employee.password" type="password"
                                        class="edit-input" />
                                    <span v-else>************</span>
                                </div>
                            </td>
                            <td>
                                <div class="cell-content">
                                    <input v-if="editingId === employee.id" v-model="employee.email"
                                        class="edit-input" />
                                    <span v-else>{{ employee.email }}</span>
                                </div>
                            </td>
                            <td>
                                <div class="cell-content">
                                    <select v-if="editingId === employee.id" v-model="employee.role" class="edit-input">
                                        <option value="內場">內場</option>
                                        <option value="外場">外場</option>
                                        <option value="管理">管理</option>
                                    </select>
                                    <span v-else>{{ employee.role }}</span>
                                </div>
                            </td>
                            <td>
                                <div class="action-buttons">
                                    <template v-if="editingId === employee.id">
                                        <button @click="saveEditing" class="action-btn save-btn">
                                            <i class="fas fa-check"></i>
                                        </button>
                                        <button @click="cancelEditing" class="action-btn cancel-btn">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </template>
                                    <template v-else>
                                        <button @click="startEditing(employee.id)" class="action-btn edit-btn">
                                            <i class="fa-solid fa-pen-to-square"></i>
                                        </button>
                                        <button @click="deleteEmployee(employee.id)" class="action-btn delete-btn">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </template>
                                </div>
                            </td>
                        </tr>
                        <tr v-if="showAddRow" class="new-employee-row">
                            <td>{{ nextEmployeeId }}</td>
                            <td><input v-model="newEmployee.name" placeholder="輸入姓名" class="edit-input"></td>
                            <td><input v-model="newEmployee.phone" placeholder="輸入電話" class="edit-input"></td>
                            <td><input v-model="newEmployee.password" placeholder="輸入密碼" type="password"
                                    class="edit-input"></td>
                            <td><input v-model="newEmployee.email" placeholder="輸入email" class="edit-input"></td>
                            <td>
                                <select v-model="newEmployee.role" class="edit-input">
                                    <option value="">選擇授權</option>
                                    <option value="內場">內場</option>
                                    <option value="外場">外場</option>
                                    <option value="管理">管理</option>
                                </select>
                            </td>
                            <td>
                                <button @click="addEmployee" class="action-btn save-btn">
                                    <i class="fas fa-check"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="pagination">
                <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1">上一頁</button>
                <span>第 {{ currentPage }} 頁 / 共 {{ totalPages }} 頁</span>
                <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">下一頁</button>
            </div>

            <div class="center-add-btn">
                <button @click="toggleAddEmployee" class="add-btn">
                    <i class="fas fa-user-plus"></i> {{ showAddRow ? '確認新增' : '新增員工' }}
                </button>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.employee-management-container {
    display: flex;
    justify-content: center;
    align-items: center;
    max-height: 90dvh;
    width: 80dvw;
    height: 90dvh;
    padding: 20px;

    .employee-management {
        height: 100%;
        width: 100%;
        max-width: 1200px;
        padding: 30px;
        background-color: #fff;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

        h2 {
            margin-bottom: 24px;
            color: #333;
            font-size: 28px;
        }

        .search-bar {
            margin-bottom: 24px;

            input {
                width: 100%;
                padding: 12px;
                border: 1px solid #ddd;
                border-radius: 6px;
                font-size: 16px;
            }
        }

        .employee-table {
            margin-bottom: 24px;
            overflow-x: auto;

            table {
                width: 100%;
                border-collapse: collapse;
                table-layout: auto;

                th,
                td {
                    padding: 12px 16px;
                    text-align: center;
                    background-color: transparent;
                    border: none;
                    min-width: 100px;
                }

                th {
                    text-align: center;
                }
            }
        }

        .cell-content {
            // display: flex;
            // align-items: center;
        }

        .edit-input {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }

        .action-buttons {
            display: flex;
            justify-content: center;
            gap: 10px;
        }

        .action-btn {
            background-color: #343a3f;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s;

            &:hover {
                background-color: #495057;
            }
        }

        .pagination {
            display: flex;
            justify-content: center;
            margin: 20px 0;

            button {
                background-color: #343a3f;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 4px;
                cursor: pointer;
                margin: 0 5px;

                &:disabled {
                    background-color: #ccc;
                    cursor: not-allowed;
                }
            }
        }

        .center-add-btn {
            display: flex;
            justify-content: center;

            .add-btn {
                background-color: #343a3f;
                color: white;
                border: none;
                padding: 10px 15px;
                border-radius: 6px;
                cursor: pointer;
                transition: background-color 0.3s;

                &:hover {
                    background-color: #495057;
                }
            }
        }
    }
}
</style>
