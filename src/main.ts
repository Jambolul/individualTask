import {errorModal, dailyModal, restaurantRow, weeklyModal} from './components';
import {fetchData} from './functions';
import { Restaurant } from './interfaces/Restaurant';
import {apiUrl, uploadUrl, positionOptions} from './variables';
import { DailyMenu } from './interfaces/daily';
import { WeeklyMenu } from './interfaces/weekly';
import { LoginUser, UpdateUser, User } from './interfaces/User';
import { UpdateResult } from './interfaces/UpdateResult';
import { UploadResult } from './interfaces/UploadResult';



// PWA code

let weeklyOrDaily = true;
const modal = document.querySelector('#menuDialog') as HTMLDialogElement;
const registerModal = document.querySelector('#registerDialog') as HTMLDialogElement;
 const loginModal = document.querySelector('#loginDialog') as HTMLDialogElement;
 const profileModal = document.querySelector('#profileDialog') as HTMLDialogElement;

// select forms from the DOM
const loginForm = document.querySelector('#login-form');
const profileForm = document.querySelector('#profile-form');
const avatarForm = document.querySelector('#avatar-form');

// select inputs from the DOM
const usernameInput = document.querySelector('#username') as HTMLInputElement | null;
const passwordInput = document.querySelector('#password') as HTMLInputElement | null;

const profileUsernameInput = document.querySelector(
  '#profile-username'
) as HTMLInputElement | null;
const profileEmailInput = document.querySelector(
  '#profile-email'
) as HTMLInputElement;

const avatarInput = document.querySelector('#avatar') as HTMLInputElement | null;

// select profile elements from the DOM
const usernameTarget = document.querySelector('#username-target');
const emailTarget = document.querySelector('#email-target');
const avatarTarget = document.querySelector('#avatar-target');
const avatarBubble = document.querySelector('#avatarBubble');

// TODO: function to login
const login = async (user: {username: string; password: string;}): Promise<LoginUser> => {
  const options: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  };
  return await fetchData<LoginUser>(apiUrl + "/auth/login", options);
};

// TODO: function to upload avatar
const uploadAvatar = async (image: File, token: string): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append("avatar", image)
  const options: RequestInit = {
    method: "POST",
    headers: {
      Authorization: `Bearer ` + token,
    },
    body: formData,
  };
  return await fetchData(apiUrl + "/users/avatar", options);
};

// TODO: function to update user data
const updateUserData = async (
  user: UpdateUser,
  token: string
): Promise<UpdateResult> => {
  const options: RequestInit = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(user),
  };
  return await fetchData<UpdateResult>(apiUrl + "/users", options);
}

// TODO: function to add userdata (email, username and avatar image) to the
// Profile DOM and Edit Profile Form
const addUserDataToDom = (user: User): void => {
  if (!usernameTarget || !emailTarget || !avatarTarget || !profileEmailInput || !profileUsernameInput) return;
  usernameTarget.innerHTML = user.username;
  emailTarget.innerHTML = user.email;
  (avatarTarget as HTMLImageElement).src = uploadUrl + user.avatar;
  (avatarBubble as HTMLImageElement).src = uploadUrl + user.avatar;

  profileEmailInput.value = user.email;
  profileUsernameInput.value = user.username;
};

// function to get userdata from API using token
const getUserData = async (token: string): Promise<User> => {
  const options: RequestInit = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return await fetchData<User>(apiUrl + "/users/token", options);
};

// TODO: function to check local storage for token and if it exists fetch
// userdata with getUserData then update the DOM with addUserDataToDom
const checkToken = async (): Promise<void> => {;
const token = localStorage.getItem("token");
if(!token){
  return;
}
const userData = await getUserData(token);
addUserDataToDom(userData);

};

// call checkToken on page load to check if token exists and update the DOM
checkToken();

// TODO: login form event listener
// event listener should call login function and save token to local storage
// then call addUserDataToDom to update the DOM with the user data



if (!modal) {
  throw new Error('Modal not found');
}
modal.addEventListener('click', () => {
  modal.close();
});


const calculateDistance = (x1: number, y1: number, x2: number, y2: number) =>
  Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);


  const createTable = (restaurants: Restaurant[]) => {
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
          const dailyMenu = await fetchData<DailyMenu>(
            apiUrl + `/restaurants/daily/${restaurant._id}/fi`
          );
          console.log(dailyMenu);

          const weeklyMenu = await fetchData<WeeklyMenu>(
            apiUrl + `/restaurants/weekly/${restaurant._id}/fi`
            );


if (weeklyOrDaily === true) {
          const dailyMenuHtml = dailyModal(restaurant, dailyMenu);
          modal.insertAdjacentHTML('beforeend', dailyMenuHtml);

          modal.showModal();
} else {
    const weeklyMenuHtml = weeklyModal(restaurant, weeklyMenu);
    modal.insertAdjacentHTML('beforeend', weeklyMenuHtml);
    modal.showModal();
}
        } catch (error) {
          modal.innerHTML = errorModal((error as Error).message);
          modal.showModal();
        }
      });
      if (index === 0) { // Add this condition to highlight the first restaurant
      tr.classList.add('closest');
      }
    });
  };


const error = (err: GeolocationPositionError) => {
  console.warn(`ERROR(${err.code}): ${err.message}`);
};

const success = async (pos: GeolocationPosition) => {
  try {
    const crd = pos.coords;
    const restaurants = await fetchData<Restaurant[]>(apiUrl + '/restaurants');
    console.log(restaurants);
    restaurants.sort((a, b) => {
    "select first restaurant"
   /*  const firstRestaurant = restaurants[0] */
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
    const dailyMenuBtn: HTMLButtonElement | null = document.querySelector('#daily');
    const weeklyMenuBtn: HTMLButtonElement | null  = document.querySelector('#weekly');
    const registerBtn: HTMLButtonElement | null = document.querySelector('#register');
    const closeRegister: HTMLButtonElement | null = document.querySelector('#close_register');
    const searchBar: HTMLInputElement | null = document.querySelector('#search');
    const loginBtn: HTMLButtonElement | null = document.querySelector('#login');
    const closeLogin: HTMLButtonElement | null = document.querySelector('#close_login');
    const closeProfile: HTMLButtonElement | null = document.querySelector('#close_profile');


    if (!searchBar) {
      throw new Error('Searchbar not found');
    }
    searchBar.addEventListener('input', () => {
      const filteredRestaurants = restaurants.filter((restaurant) =>
        restaurant.city.toLowerCase().includes(searchBar.value.toLowerCase())
      );
      createTable(filteredRestaurants);
    });


  if (weeklyMenuBtn !== null) {
        weeklyMenuBtn.addEventListener("click", () => {
            weeklyOrDaily = false;
            console.log(weeklyOrDaily);
        });
}
if (dailyMenuBtn !== null) {
  dailyMenuBtn.addEventListener("click", () => {
      weeklyOrDaily = true;
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
    }
    );
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
  if (avatarBubble !== null) {
    avatarBubble.addEventListener("click", () => {
      profileModal.showModal();
    });
  }
  if (closeProfile !== null) {
    closeProfile.addEventListener("click", () => {
      profileModal.close();
    });
  }



  const checkbox = document.getElementById('checkbox');
  if (!checkbox) {
    throw new Error('Checkbox not found');
  }
  checkbox.addEventListener('change', () => {
    document.body.classList.toggle('dark');
  });

  const formEl = document.querySelector(".registerForm") as HTMLFormElement;

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


} catch (error) {
    modal.innerHTML = errorModal((error as Error).message);
    modal.showModal();
  }
};

loginForm?.addEventListener('submit', async (evt)=>{
  evt.preventDefault();
  if (!usernameInput || !passwordInput) return;
  const user = {
    username: usernameInput.value,
    password: passwordInput.value,
  }
  const loginData = await login(user);
  console.log(loginData);
  loginModal.close();
  /* alert(loginData.message); */
  addUserDataToDom(loginData.data);
  localStorage.setItem("token", loginData.token);
});

// TODO: profile form event listener
// event listener should call updateUserData function and update the DOM with
// the user data by calling addUserDataToDom or checkToken
profileForm?.addEventListener('submit', async (evt)=>{
  evt.preventDefault();
  if (!profileUsernameInput || !profileEmailInput) return;
  const user = {
    username: profileUsernameInput.value,
    email: profileEmailInput.value,
  }
  const token = localStorage.getItem("token");
  if (!token) {
    return;
  }
  const updateData = await updateUserData(user, token);
  addUserDataToDom(updateData.data);
});


// TODO: avatar form event listener
// event listener should call uploadAvatar function and update the DOM with
// the user data by calling addUserDataToDom or checkToken
avatarForm?.addEventListener('submit', async (evt)=>{
  evt.preventDefault();
if (!avatarInput?.files) {
  return;
}

  const image = avatarInput.files[0];

  const token = localStorage.getItem("token");
  if (!token) {
    return;
  }
  const avatarData = await uploadAvatar(image, token);
  console.log(avatarData);
  checkToken();
});


/* const formEl = document.querySelector("#loginForm") as HTMLFormElement;

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

try {

} catch (error) {
  modal.innerHTML = errorModal((error as Error).message);
  modal.showModal();
} */

navigator.geolocation.getCurrentPosition(success, error, positionOptions);
