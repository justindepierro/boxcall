// src/config/themes/themeLoader.js
import { themeMap } from './themeMap.js'

export function applyFontTheme(themeKey) {
  const fonts = themeMap[themeKey]?.fonts ?? themeMap.classic.fonts
  const classList = document.body.classList

  Object.values(themeMap).forEach(({ fonts }) => {
    classList.remove(fonts.header, fonts.body, fonts.mono)
  })

  classList.add(fonts.header, fonts.body, fonts.mono)
}

export function applyColorTheme(themeKey) {
  const colors = themeMap[themeKey]?.colors ?? themeMap.classic.colors
  const classList = document.body.classList

  Object.values(themeMap).forEach(({ colors }) => {
    Object.values(colors).forEach(c => classList.remove(c))
  })

  classList.add(colors.bg, colors.text)
}