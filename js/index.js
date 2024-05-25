import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const appSettings = {
    databaseURL: "https://realtime-database-59666-default-rtdb.europe-west1.firebasedatabase.app/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const shoppingListInDB = ref(database, "shoppingList")

const inputFieldEl = document.getElementById("input-field")
const addButtonEl = document.getElementById("add-button")
const shoppingListEl = document.getElementById("shopping-list")

addButtonEl.addEventListener("click", function() {
    addItem();
});

inputFieldEl.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        addItem();
    }
});

// function addItem() {
//     let inputValue = inputFieldEl.value;
    
//     if (inputValue !== "") {
//         let itemsArray = Object.values(shoppingListInDB);
        
//         if (itemsArray.includes(inputValue)) {
//             inputFieldEl.value = "ERROR!";
//         } else {
//             push(shoppingListInDB, inputValue);
//             clearInputFieldEl();
//         }
//     } else {
//         inputFieldEl.value = "add product here"
//         setTimeout(function() {
//             inputFieldEl.value = ""
//         }, 500);
//     }
// }

// Function to add an item
function addItem() {
    let inputValue = inputFieldEl.value.trim(); // Ensure the input is trimmed
    
    if (inputValue !== "") {
        // Retrieve the current items from the database
        onValue(shoppingListInDB, function(snapshot) {
            if (snapshot.exists()) {
                let itemsArray = Object.values(snapshot.val());
                
                // Check if the item already exists
                if (itemsArray.includes(inputValue)) {
                    inputFieldEl.value = "ERROR!!!";
                    setTimeout(function() {
                        inputFieldEl.value = "";
                    }, 500);
                } else {
                    // Push the new item to the database
                    push(shoppingListInDB, inputValue);
                    clearInputFieldEl();
                }
            } else {
                // No items in the database, add the new item
                push(shoppingListInDB, inputValue);
                clearInputFieldEl();
            }
        }, { onlyOnce: true }); // Listen for the value once
    } else {
        inputFieldEl.value = "add product here";
        setTimeout(function() {
            inputFieldEl.value = "";
        }, 500);
    }
}

onValue(shoppingListInDB, function(snapshot) {
    if (snapshot.exists()) {
        let itemsArray = Object.entries(snapshot.val())
    
        clearShoppingListEl()
        
        for (let i = 0; i < itemsArray.length; i++) {
            let currentItem = itemsArray[i]
            let currentItemID = currentItem[0]
            let currentItemValue = currentItem[1]
            
            appendItemToShoppingListEl(currentItem)
        }    
    } else {
        shoppingListEl.innerHTML = "Nothing to see here... add some products to the list!"
    }
})

function clearShoppingListEl() {
    shoppingListEl.innerHTML = ""
}

function clearInputFieldEl() {
    inputFieldEl.value = ""
}

function appendItemToShoppingListEl(item) {
    let itemID = item[0]
    let itemValue = item[1]
    
    let newEl = document.createElement("li")
    newEl.setAttribute("tabindex", "0")
    
    newEl.textContent = itemValue
    
    newEl.addEventListener("click", function() {
        let exactLocationOfItemInDB = ref(database, `shoppingList/${itemID}`)
        newEl.classList.add("deleted")
        setTimeout(function() {
            remove(exactLocationOfItemInDB)
        }, 500)
    })
    
    shoppingListEl.append(newEl)
}