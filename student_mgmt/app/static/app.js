const api = {
  students: "/api/students",
  courses: "/api/courses",
  enrollments: "/api/enrollments",
};

async function jsonFetch(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    let msg = `请求失败: ${res.status}`;
    try {
      const data = await res.json();
      if (data?.detail) msg = Array.isArray(data.detail) ? data.detail.map(d => d.msg).join("; ") : data.detail;
    } catch {}
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  return res.json();
}

function showError(error) {
  alert(error.message || String(error));
}

// Students page
async function initStudentsPage() {
  const form = document.getElementById("student-form");
  const tableBody = document.querySelector("#students-table tbody");

  async function load() {
    const list = await jsonFetch(api.students);
    tableBody.innerHTML = "";
    list.forEach((s) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${s.id}</td>
        <td>${s.name}</td>
        <td>${s.email}</td>
        <td>${s.age ?? ""}</td>
        <td>
          <button class="btn btn-sm btn-outline-secondary me-2" data-action="edit" data-id="${s.id}">编辑</button>
          <button class="btn btn-sm btn-outline-danger" data-action="del" data-id="${s.id}">删除</button>
        </td>`;
      tableBody.appendChild(tr);
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById("student-name").value.trim(),
      email: document.getElementById("student-email").value.trim(),
      age: document.getElementById("student-age").value ? Number(document.getElementById("student-age").value) : null,
    };
    try {
      await jsonFetch(api.students, { method: "POST", body: JSON.stringify(payload) });
      form.reset();
      await load();
    } catch (err) {
      showError(err);
    }
  });

  tableBody.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = btn.getAttribute("data-id");
    const action = btn.getAttribute("data-action");

    if (action === "del") {
      if (!confirm("确认删除该学生？")) return;
      try {
        await jsonFetch(`${api.students}/${id}`, { method: "DELETE" });
        await load();
      } catch (err) {
        showError(err);
      }
    } else if (action === "edit") {
      const name = prompt("姓名");
      const email = prompt("邮箱");
      const ageStr = prompt("年龄(可空)");
      const payload = {};
      if (name) payload.name = name;
      if (email) payload.email = email;
      if (ageStr !== null && ageStr !== "") payload.age = Number(ageStr);
      try {
        await jsonFetch(`${api.students}/${id}`, { method: "PUT", body: JSON.stringify(payload) });
        await load();
      } catch (err) {
        showError(err);
      }
    }
  });

  await load();
}

// Courses page
async function initCoursesPage() {
  const form = document.getElementById("course-form");
  const tableBody = document.querySelector("#courses-table tbody");

  async function load() {
    const list = await jsonFetch(api.courses);
    tableBody.innerHTML = "";
    list.forEach((c) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${c.id}</td>
        <td>${c.code}</td>
        <td>${c.title}</td>
        <td>${c.credits}</td>
        <td>
          <button class="btn btn-sm btn-outline-secondary me-2" data-action="edit" data-id="${c.id}">编辑</button>
          <button class="btn btn-sm btn-outline-danger" data-action="del" data-id="${c.id}">删除</button>
        </td>`;
      tableBody.appendChild(tr);
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      code: document.getElementById("course-code").value.trim(),
      title: document.getElementById("course-title").value.trim(),
      credits: Number(document.getElementById("course-credits").value || 3),
    };
    try {
      await jsonFetch(api.courses, { method: "POST", body: JSON.stringify(payload) });
      form.reset();
      await load();
    } catch (err) {
      showError(err);
    }
  });

  tableBody.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = btn.getAttribute("data-id");
    const action = btn.getAttribute("data-action");

    if (action === "del") {
      if (!confirm("确认删除该课程？")) return;
      try {
        await jsonFetch(`${api.courses}/${id}`, { method: "DELETE" });
        await load();
      } catch (err) {
        showError(err);
      }
    } else if (action === "edit") {
      const code = prompt("课程代码");
      const title = prompt("课程名称");
      const creditsStr = prompt("学分");
      const payload = {};
      if (code) payload.code = code;
      if (title) payload.title = title;
      if (creditsStr) payload.credits = Number(creditsStr);
      try {
        await jsonFetch(`${api.courses}/${id}`, { method: "PUT", body: JSON.stringify(payload) });
        await load();
      } catch (err) {
        showError(err);
      }
    }
  });

  await load();
}

// Enrollments page
async function initEnrollmentsPage() {
  const form = document.getElementById("enrollment-form");
  const tableBody = document.querySelector("#enrollments-table tbody");
  const selStudent = document.getElementById("enrollment-student");
  const selCourse = document.getElementById("enrollment-course");

  let students = [];
  let courses = [];

  function nameById(list, id, key = "name") {
    const item = list.find((x) => x.id === id);
    return item ? item[key] : id;
  }

  async function loadRefs() {
    students = await jsonFetch(api.students);
    courses = await jsonFetch(api.courses);

    selStudent.innerHTML = students.map((s) => `<option value="${s.id}">${s.name} (${s.email})</option>`).join("");
    selCourse.innerHTML = courses.map((c) => `<option value="${c.id}">${c.code} - ${c.title}</option>`).join("");
  }

  async function load() {
    const list = await jsonFetch(api.enrollments);
    tableBody.innerHTML = "";
    list.forEach((en) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${en.id}</td>
        <td>${nameById(students, en.student_id, "name")}</td>
        <td>${nameById(courses, en.course_id, "title")}</td>
        <td>${en.grade ?? ""}</td>
        <td>
          <button class="btn btn-sm btn-outline-secondary me-2" data-action="grade" data-id="${en.id}">录入成绩</button>
          <button class="btn btn-sm btn-outline-danger" data-action="del" data-id="${en.id}">删除</button>
        </td>`;
      tableBody.appendChild(tr);
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      student_id: Number(selStudent.value),
      course_id: Number(selCourse.value),
    };
    try {
      await jsonFetch(api.enrollments, { method: "POST", body: JSON.stringify(payload) });
      await load();
    } catch (err) {
      showError(err);
    }
  });

  tableBody.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = btn.getAttribute("data-id");
    const action = btn.getAttribute("data-action");

    if (action === "del") {
      if (!confirm("确认删除该选课记录？")) return;
      try {
        await jsonFetch(`${api.enrollments}/${id}`, { method: "DELETE" });
        await load();
      } catch (err) {
        showError(err);
      }
    } else if (action === "grade") {
      const grade = prompt("成绩(可空)");
      try {
        await jsonFetch(`${api.enrollments}/${id}`, { method: "PUT", body: JSON.stringify({ grade }) });
        await load();
      } catch (err) {
        showError(err);
      }
    }
  });

  await loadRefs();
  await load();
}

// Router
window.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("students-page")) return void initStudentsPage();
  if (document.getElementById("courses-page")) return void initCoursesPage();
  if (document.getElementById("enrollments-page")) return void initEnrollmentsPage();
});