// Using Netlify Function (server) instead of Firebase. The server handles DB access.
const API_BASE = '/.netlify/functions/items'

const inputFieldEl = document.getElementById("input-field")
const addButtonEl = document.getElementById("add-button")
const shoppingListEl = document.getElementById("shopping-list")
const statusEl = document.getElementById('status')

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
async function addItem() {
    const inputValue = inputFieldEl.value.trim();
    if (!inputValue) {
        showStatus('Add a product name')
        return
    }

    try {
        const res = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ item: inputValue })
        })

        if (res.status === 201) {
            const newItem = await res.json()
            appendItemToShoppingListEl([String(newItem.id), newItem.item])
            clearInputFieldEl()
        } else if (res.status === 409) {
            showStatus('Item already exists')
        } else {
            showStatus('Server error')
        }
    } catch (err) {
        console.error(err)
        showStatus('Network error')
    }
}

function showStatus(message, timeout = 1200) {
    if (!statusEl) return
    statusEl.textContent = message
    if (timeout) setTimeout(() => {
        if (statusEl.textContent === message) statusEl.textContent = ''
    }, timeout)
}

// Load items from server and render
async function loadItems() {
    try {
        const res = await fetch(API_BASE)
        if (!res.ok) throw new Error('Failed to load')
        const items = await res.json()
        if (!Array.isArray(items) || items.length === 0) {
            shoppingListEl.innerHTML = 'Nothing to see here... add some products to the list!'
            return
        }

        clearShoppingListEl()
        for (const row of items) {
            // row: { id, item }
            appendItemToShoppingListEl([String(row.id), row.item])
        }
    } catch (err) {
        console.error(err)
        shoppingListEl.innerHTML = 'Unable to load items.'
    }
}

// Initial load
loadItems()

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

    newEl.addEventListener("click", async function() {
        newEl.classList.add("deleted")
        try {
            await fetch(`${API_BASE}?id=${encodeURIComponent(itemID)}`, { method: 'DELETE' })
            setTimeout(() => newEl.remove(), 500)
        } catch (err) {
            console.error(err)
            newEl.classList.remove('deleted')
        }
    })

    shoppingListEl.append(newEl)
}