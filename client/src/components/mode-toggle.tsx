import { Moon, Sun } from "lucide-react"
import { useTheme } from "./theme-provider"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      title="Toggle theme"
    >
      {theme === "dark" ? (
        <Moon className="h-5 w-5 text-gray-900 dark:text-gray-100" />
      ) : (
        <Sun className="h-5 w-5 text-gray-900 dark:text-gray-100" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
