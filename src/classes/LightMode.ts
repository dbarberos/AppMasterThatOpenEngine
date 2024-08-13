let lightMode = localStorage.getItem("light-mode")
const themeSwitch = document.getElementById("theme-switch")

const enableLightMode = () => {
    document.body.classList.add("light-mode")
    localStorage.setItem("light-mode", "active")

}

const disableLightMode = () => {
    document.body.classList.remove("light-mode")
    localStorage.setItem("light-mode", "")
}

if (lightMode === "active") enableLightMode()

themeSwitch?.addEventListener("click", () => {
    lightMode = localStorage.getItem("light-mode")
    lightMode !== "active" ? enableLightMode() : disableLightMode()
})