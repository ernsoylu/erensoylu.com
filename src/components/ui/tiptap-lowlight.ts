import { createLowlight, common } from "lowlight"
import c from "highlight.js/lib/languages/c"
import cpp from "highlight.js/lib/languages/cpp"
import javascript from "highlight.js/lib/languages/javascript"
import typescript from "highlight.js/lib/languages/typescript"
import python from "highlight.js/lib/languages/python"
import go from "highlight.js/lib/languages/go"
import rust from "highlight.js/lib/languages/rust"
import julia from "highlight.js/lib/languages/julia"
import sql from "highlight.js/lib/languages/sql"
import java from "highlight.js/lib/languages/java"
import kotlin from "highlight.js/lib/languages/kotlin"

export const lowlight = createLowlight(common)
lowlight.register("c", c)
lowlight.register("cpp", cpp)
lowlight.register("javascript", javascript)
lowlight.register("typescript", typescript)
lowlight.register("python", python)
lowlight.register("go", go)
lowlight.register("rust", rust)
lowlight.register("julia", julia)
lowlight.register("sql", sql)
lowlight.register("java", java)
lowlight.register("kotlin", kotlin)

