# Component Specification: New Chat View (`new-chat-spec.md`)

## 1. Overview

The **New Chat View** serves as the initial landing screen for starting a conversation with the AI chatbot. It features a centered hero welcome screen and a floating, multi-functional input bar anchored to the bottom of the viewport.

---

## 2. Layout & Visual Architecture

### 2.1 Center Stage ( Hero / Greeting )

- **Spark / AI Icon:** A centered multi-colored gradient star or spark icon rendered directly above the greeting text.
- **Greeting Header:** Dynamic greeting text (e.g., `Hi Dana, let's get into it`) rendered in medium-weight, high-contrast typography.
- **Alignment:** Centered both vertically and horizontally within the main viewport container.

### 2.2 Bottom Fixed / Floating Input Bar

- **Shape & Container:** rounded rectangle layout (`rounded-lg`) floating above the bottom edge of the screen.
- **Background & Border:** Light, subtle neutral background with a soft border line and minimal drop shadow.
- **Layout Structure:** Single-row horizontal flexbox containing:
  - **Far Left Action:** Plus (`+`) button for attaching files.
  - **Center Input Area:** Expandable text field with placeholder text (`Ask Promptly`).
  - **Far Right Actions:** Microphone icon for voice dictation and an interactive Send button.

---

## 3. Component Breakdown & Functional Specs

### 3.1 File Upload Attachment (`+` Button)

- **Trigger:** Plus icon located on the far left inside the input bar.
- **Behavior:**
  - Clicking opens the native OS file picker (`<input type="file" />`).
  - Supports drag-and-drop file staging anywhere onto the input bar region.
- **Supported Media Types:** Images (`.png`, `.jpg`, `.webp`), Documents (`.pdf`, `.txt`, `.csv`, `.docx`).
- **State Management:**
  - Selected files render as removable chip/badge previews directly above the input capsule before sending.
  - Users can remove individual queued files prior to message dispatch.

### 3.2 Dynamic Text Area

- **Behavior:** Auto-resizing multi-line text input field that expands upward up to a defined maximum height (e.g., 128px) before scrolling internally.
- **Keyboard Navigation:**
  - `Enter`: Triggers message submission (if non-empty).
  - `Shift + Enter`: Inserts a line break without submitting.
- **Placeholder Text:** Default placeholder set to `Ask Promptly` (configurable).

### 3.3 Voice Dictation (Microphone Icon)

- **Trigger:** Microphone icon situated on the right side of the input field.
- **Behavior:**
  - Activates speech recognition via Web Speech API or streaming audio service.
  - Displays visual feedback (e.g., pulsing red ring or audio waveform) while active.
  - Appends recognized speech in real time into the text area.

### 3.4 Send / Submit Action

- **Trigger:** `Enter` keypress or clicking the Send button on the far right.
- **Behavior:**
  - Compiles text prompt and staged file attachments into a payload.
  - Dispatches the request to the Next.js API endpoint / Server Action.
  - Transitions the view from the **New Chat State** into the **Active Chat / Stream State**.

---

## 4. State Transitions & Interaction Lifecycle

1. **Initial Empty State:** Displays greeting hero, empty text field with `Ask Promptly` placeholder, file upload button, and microphone icon.
2. **File Attached State:** Shows file chips/badges above the input bar with remove (`x`) buttons.
3. **Text Active State:** Typing reveals the Send button (either replacing or appearing alongside the microphone icon).
4. **Dictation Active State:** Microphone icon animates; text input populates continuously from speech recognition.
5. **Submitting / Streaming State:** Disables the input controls, clears text/attachments, and seamlessly navigates or swaps view to the streaming message thread.

---

## 5. Accessibility & Mobile Specs

- **Focus Management:** Auto-focus the text area on initial page load.
- **Keyboard Navigation:** Sequential `Tab` flow: `Upload File` -> `Text Input` -> `Dictation` -> `Send`.
- **Mobile Adaptability:** Enforces fixed bottom positioning with `env(safe-area-inset-bottom)` to prevent mobile virtual keyboards from obscuring the input bar.
