'use strict';

const restaurantRow = (restaurant) => {
    const { name, address, company } = restaurant;
    const tr = document.createElement('tr');
    const nameCell = document.createElement('td');
    nameCell.innerText = name;
    const addressCell = document.createElement('td');
    addressCell.innerText = address;
    const companyCell = document.createElement('td');
    companyCell.innerText = company;
    tr.appendChild(nameCell);
    tr.appendChild(addressCell);
    tr.appendChild(companyCell);
    return tr;
};
const dailyModal = (restaurant, daily) => {
    const { name, address, city, postalCode, phone, company } = restaurant;
    console.log(restaurant);
    let html = `<h3>${name}</h3>
  <p>${company}</p>
  <p>${address} ${postalCode} ${city}</p>
  <p>${phone}</p>
  <table>
    <tr>
      <th>Course</th>
      <th>Diet</th>
      <th>Price</th>
    </tr>`;
    daily.courses.forEach(course => {
        const { name, diets, price } = course;
        html += `
    <tr>
      <td>${name}</td>
      <td>${diets ?? ' - '}</td>
      <td>${price ?? ' - '}</td>
    </tr>`;
    });
    html += '</table>';
    return html;
};
const weeklyModal = (restaurant, weekly) => {
    const { name, address, city, postalCode, phone, company } = restaurant;
    let html = `<h3>${name}</h3>
    <p>${company}</p>
    <p>${address} ${postalCode} ${city}</p>
    <p>${phone}</p>
    <table>
    <tr>
      <th>Date</th>
      <th>Course</th>
      <th>Diet</th>
      <th>Price</th>
    </tr>`;
    weekly.days.forEach(day => {
        const { date } = day;
        html += `
  <tr>
    <td>${date}</td>
  </tr>`;
        day.courses.forEach(course => {
            const { name, diets, price } = course;
            html += `
            <tr>
            <td></td>
              <td>${name}</td>
              <td>${diets ?? ' - '}</td>
              <td>${price ?? ' - '}</td>
            </tr>`;
        });
    });
    html += '</table>';
    return html;
};
const errorModal = (message) => {
    const html = `
        <h3>Error</h3>
        <p>${message}</p>
       `;
    return html;
};

const fetchData = async (url, options = {}) => {
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`Error ${response.status} occured`);
    }
    const json = response.json();
    return json;
};

const apiUrl = 'https://student-restaurants.azurewebsites.net/api/v1';
const positionOptions = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
};

// PWA code
let weeklyOrDaily = true;
const modal = document.querySelector('#menuDialog');
const registerModal = document.querySelector('#registerDialog');
const loginModal = document.querySelector('#loginDialog');
if (!modal) {
    throw new Error('Modal not found');
}
modal.addEventListener('click', () => {
    modal.close();
});
const calculateDistance = (x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
const createTable = (restaurants) => {
    const table = document.querySelector('table');
    if (!table) {
        throw new Error('Table not found');
    }
    table.innerHTML = '';
    restaurants.forEach((restaurant, index) => {
        const tr = restaurantRow(restaurant);
        table.appendChild(tr);
        tr.addEventListener('click', async () => {
            try {
                // remove all highlights
                const allHighs = document.querySelectorAll('.highlight');
                allHighs.forEach((high) => {
                    high.classList.remove('highlight');
                });
                // add highlight
                tr.classList.add('highlight');
                // add restaurant data to modal
                modal.innerHTML = '';
                // fetch menu
                const dailyMenu = await fetchData(apiUrl + `/restaurants/daily/${restaurant._id}/fi`);
                console.log(dailyMenu);
                const weeklyMenu = await fetchData(apiUrl + `/restaurants/weekly/${restaurant._id}/fi`);
                if (weeklyOrDaily === true) {
                    const dailyMenuHtml = dailyModal(restaurant, dailyMenu);
                    modal.insertAdjacentHTML('beforeend', dailyMenuHtml);
                    modal.showModal();
                }
                else {
                    const weeklyMenuHtml = weeklyModal(restaurant, weeklyMenu);
                    modal.insertAdjacentHTML('beforeend', weeklyMenuHtml);
                    modal.showModal();
                }
            }
            catch (error) {
                modal.innerHTML = errorModal(error.message);
                modal.showModal();
            }
        });
        if (index === 0) { // Add this condition to highlight the first restaurant
            tr.classList.add('closest');
        }
    });
};
const error = (err) => {
    console.warn(`ERROR(${err.code}): ${err.message}`);
};
const success = async (pos) => {
    try {
        const crd = pos.coords;
        const restaurants = await fetchData(apiUrl + '/restaurants');
        console.log(restaurants);
        restaurants.sort((a, b) => {
            "select first restaurant";
            const firstRestaurant = restaurants[0];
            const x1 = crd.latitude;
            const y1 = crd.longitude;
            const x2a = a.location.coordinates[1];
            const y2a = a.location.coordinates[0];
            const distanceA = calculateDistance(x1, y1, x2a, y2a);
            const x2b = b.location.coordinates[1];
            const y2b = b.location.coordinates[0];
            const distanceB = calculateDistance(x1, y1, x2b, y2b);
            return distanceA - distanceB;
        });
        createTable(restaurants);
        // buttons for filtering
        const sodexoBtn = document.querySelector('#sodexo');
        const compassBtn = document.querySelector('#compass');
        const resetBtn = document.querySelector('#reset');
        const dailyMenuBtn = document.querySelector('#daily');
        const weeklyMenuBtn = document.querySelector('#weekly');
        const registerBtn = document.querySelector('#register');
        const closeRegister = document.querySelector('#close_register');
        const loginBtn = document.querySelector('#login');
        const closeLogin = document.querySelector('#close_login');
        if (!sodexoBtn || !compassBtn || !resetBtn) {
            throw new Error('Button not found');
        }
        sodexoBtn.addEventListener('click', () => {
            const sodexoRestaurants = restaurants.filter((restaurant) => restaurant.company === 'Sodexo');
            console.log(sodexoRestaurants);
            createTable(sodexoRestaurants);
        });
        compassBtn.addEventListener('click', () => {
            const compassRestaurants = restaurants.filter((restaurant) => restaurant.company === 'Compass Group');
            console.log(compassRestaurants);
            createTable(compassRestaurants);
        });
        resetBtn.addEventListener('click', () => {
            createTable(restaurants);
        });
        if (dailyMenuBtn !== null) {
            dailyMenuBtn.addEventListener("click", () => {
                weeklyOrDaily = true;
                console.log(weeklyOrDaily);
            });
        }
        if (weeklyMenuBtn !== null) {
            weeklyMenuBtn.addEventListener("click", () => {
                weeklyOrDaily = false;
                console.log(weeklyOrDaily);
            });
        }
        if (registerBtn !== null) {
            registerBtn.addEventListener("click", () => {
                registerModal.showModal();
            });
        }
        if (closeRegister !== null) {
            closeRegister.addEventListener("click", () => {
                registerModal.close();
            });
        }
        if (loginBtn !== null) {
            loginBtn.addEventListener("click", () => {
                loginModal.showModal();
            });
        }
        if (closeLogin !== null) {
            closeLogin.addEventListener("click", () => {
                loginModal.close();
            });
        }
        const formEl = document.querySelector(".registerForm");
        formEl.addEventListener("submit", event => {
            event.preventDefault();
            const formData = new FormData(formEl);
            const username = formData.get("registerUsername");
            const password = formData.get("registerPwd");
            const email = formData.get("email");
            // Create an object with the form values
            const userData = {
                username,
                password,
                email
            };
            console.log(userData);
            fetch(apiUrl + "/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData)
            })
                .then(response => response.json())
                .then(json => {
                console.log(json);
                registerModal.close();
            })
                .catch(error => console.error(error));
        });
    }
    catch (error) {
        modal.innerHTML = errorModal(error.message);
        modal.showModal();
    }
};
const formEl = document.querySelector("#loginForm");
formEl.addEventListener("submit", event => {
    event.preventDefault();
    const formData = new FormData(formEl);
    const username = formData.get("loginUsername");
    const password = formData.get("loginPwd");
    // Create an object with the form values
    const userData = {
        username,
        password
    };
    console.log(userData);
    fetch(apiUrl + "/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
    })
        .then(response => response.json())
        .then(json => {
        console.log(json);
        loginModal.close();
    })
        .catch(error => console.error(error));
});
navigator.geolocation.getCurrentPosition(success, error, positionOptions);
