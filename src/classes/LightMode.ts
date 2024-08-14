type Theme = "dark" | "light"

let themeMode = localStorage.getItem("themeMode")
const themeSwitch = document.getElementById("theme-switch") as HTMLButtonElement
const body = document.body

// Check if the user prefers dark mode
const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
// Set the initial theme based on user preference or data-theme attribute
const initialTheme = body.dataset.theme || (prefersDarkMode ? 'dark' : 'light');
body.dataset.theme = initialTheme;


const toggleMode = () => {
    const currentThemeMode = localStorage.getItem("themeMode")
    currentThemeMode !== "active" ? enableLightMode() : disableLightMode()
    const currentThemeData = body.dataset.theme as Theme;
    const newTheme = currentThemeData === 'dark' ? 'light' : 'dark';
    body.dataset.theme = newTheme;
}

const enableLightMode = () => {
    document.body.classList.add("light-mode")
    localStorage.setItem("themeMode", "active")
}

const disableLightMode = () => {
    document.body.classList.remove("light-mode")
    localStorage.setItem("themeMode", "")
}

if (themeMode === "active") {
    enableLightMode()
} else {
    disableLightMode
}

themeSwitch?.addEventListener("click", () => {
    toggleMode()
    const body = document.body
    const currenTheme = body.dataset.theme;
    const newTheme = currenTheme === "dark" ? "light" : "dark";
    body.dataset.theme = newTheme; 
})




// const button = document.querySelector('button')
// const heading = document.querySelector('h1')


// const isDark = document.documentElement.dataset.theme === 'dark' || matchMedia('(prefers-color-scheme: dark)').matches
// heading.innerText = `Now with ${isDark ? 'Light' : 'Dark'} Mode.`
// button.setAttribute('aria-pressed', isDark ? false : true)
// document.documentElement.dataset.theme = isDark ? 'dark' : 'light'

// const sync = () => {
//     const darkNow = button.matches('[aria-pressed=false]')
//     document.documentElement.dataset.theme = darkNow ? 'light' : 'dark'
//     heading.innerText = `Now with ${darkNow ? 'Dark' : 'Light'} Mode.`
//     button.setAttribute('aria-pressed', darkNow ? true : false)
// }

// const handleSync = () => {
//     if (!document.startViewTransition) return sync()
//     document.startViewTransition(sync)
// }

// button.addEventListener('click', handleSync)