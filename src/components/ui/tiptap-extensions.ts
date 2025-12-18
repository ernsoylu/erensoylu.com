import { ReactNodeViewRenderer } from "@tiptap/react"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import Image from "@tiptap/extension-image"
import { lowlight } from "./tiptap-lowlight"
import { CodeBlockComponent } from "./CodeBlockComponent"
import { ResizableImageComponent } from "./ResizableImageComponent"

export function createCodeBlockExtension() {
  return CodeBlockLowlight.configure({
    lowlight,
    defaultLanguage: "javascript",
  }).extend({
    addNodeView() {
      return ReactNodeViewRenderer(CodeBlockComponent)
    },
  })
}

export function createResizableImageExtension() {
  return Image.extend({
    addAttributes() {
      return {
        src: {
          default: null,
        },
        alt: {
          default: null,
        },
        title: {
          default: null,
        },
        width: {
          default: "100%",
          renderHTML: (attributes) => {
            return {
              width: attributes.width,
              style: `width: ${attributes.width}`,
            }
          },
        },
        align: {
          default: "center",
          renderHTML: (attributes) => {
            return {
              "data-align": attributes.align,
            }
          },
        },
      }
    },
    addNodeView() {
      return ReactNodeViewRenderer(ResizableImageComponent)
    },
  })
}

