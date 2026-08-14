---
name: catwords-project
description: Maintain and extend the CatWords WebApp consistently across UI, learning flows, character assets, local persistence, validation, and Git workflows. Use for any CatWords feature, design, asset, content, or repository task.
---

# Catwords Project

Use this skill whenever working in `C:\Users\Macbook Air\CatWords` or on CatWords assets. Preserve the project's visual language, local-first workflow, learning state, and character identity.

## Project standards

[TODO: Choose the structure that best fits this skill's purpose. Common patterns:

**1. Workflow-Based** (best for sequential processes)
- Works well when there are clear step-by-step procedures
- Example: DOCX skill with "Workflow Decision Tree" -> "Reading" -> "Creating" -> "Editing"
- Structure: ## Overview -> ## Workflow Decision Tree -> ## Step 1 -> ## Step 2...

**2. Task-Based** (best for tool collections)
- Works well when the skill offers different operations/capabilities
- Example: PDF skill with "Quick Start" -> "Merge PDFs" -> "Split PDFs" -> "Extract Text"
- Structure: ## Overview -> ## Quick Start -> ## Task Category 1 -> ## Task Category 2...

**3. Reference/Guidelines** (best for standards or specifications)
- Works well for brand guidelines, coding standards, or requirements
- Example: Brand styling with "Brand Guidelines" -> "Colors" -> "Typography" -> "Features"
- Structure: ## Overview -> ## Guidelines -> ## Specifications -> ## Usage...

**4. Capabilities-Based** (best for integrated systems)
- Works well when the skill provides multiple interrelated features
- Example: Product Management with "Core Capabilities" -> numbered capability list
- Structure: ## Overview -> ## Core Capabilities -> ### 1. Feature -> ### 2. Feature...

Patterns can be mixed and matched as needed. Most skills combine patterns (e.g., start with task-based, add workflow for complex operations).

- Treat the character master sheets as canonical identity references.
- Keep characters cute Chibi: short compact body, oversized head, rounded forms, large expressive eyes, soft pastel palette, gentle outlines. Do not make them realistic, tall, slim, or mature.
- Use Mochi's master sheet as the layout standard: Front/Side/Back, Color Palette, Expressions, and Poses.
- Use English text with Poppins and Thai text with Anuphan. Keep responsive Desktop/Mobile layouts and the CatWords blue/cream/peach/mint theme.
- Keep Mobile navigation sticky and Back to Top unobtrusive and scroll-triggered.

## WebApp workflow

- Inspect the page, scripts, localStorage keys, assets, and Git status before editing.
- Preserve the flow Home → Daily Lesson → pronunciation → Quiz → five-answer result cards → Progress.
- Store reusable vocabulary and quizzes in the content library; do not regenerate existing content unnecessarily.
- Keep learner state local until Firebase is explicitly requested. Use `catwords-mvp-progress` unless a migration is planned.
- Run JavaScript syntax and local-reference checks after changes.
- Commit intentionally and do not push unless the user explicitly asks.

## Character asset workflow

- Work one character at a time and compare against its canonical master sheet.
- For generated raster art, use the imagegen skill with the character as identity reference and Mochi's sheet as structure reference. Generate a pose sheet first, remove chroma-key backgrounds, and inspect every cutout.
- For source-faithful extraction, crop only from the supplied master sheet; never invent missing views or poses.
- Store assets under `public/assets/characters/<slug>/` and inspect for neighboring poses, clipped props, green fringe, opaque corners, and inconsistent proportions.

## Git and delivery

- Check `git status --short --branch` before and after work.
- Stage explicit paths when the worktree is mixed. Never reset or delete unrelated changes.
- Push only after explicit instruction and verify local/remote hashes after pushing.

For the roster, asset paths, data model, and project decisions, read [references/project-reference.md](references/project-reference.md).

## Resources (optional)

Create only the resource directories this skill actually needs. Delete this section if no resources are required.

### scripts/
Executable code (Python/Bash/etc.) that can be run directly to perform specific operations.

**Examples from other skills:**
- PDF skill: `fill_fillable_fields.py`, `extract_form_field_info.py` - utilities for PDF manipulation
- DOCX skill: `document.py`, `utilities.py` - Python modules for document processing

**Appropriate for:** Python scripts, shell scripts, or any executable code that performs automation, data processing, or specific operations.

**Note:** Scripts may be executed without loading into context, but can still be read by Codex for patching or environment adjustments.

### references/
Documentation and reference material intended to be loaded into context to inform Codex's process and thinking.

**Examples from other skills:**
- Product management: `communication.md`, `context_building.md` - detailed workflow guides
- BigQuery: API reference documentation and query examples
- Finance: Schema documentation, company policies

**Appropriate for:** In-depth documentation, API references, database schemas, comprehensive guides, or any detailed information that Codex should reference while working.

### assets/
Files not intended to be loaded into context, but rather used within the output Codex produces.

**Examples from other skills:**
- Brand styling: PowerPoint template files (.pptx), logo files
- Frontend builder: HTML/React boilerplate project directories
- Typography: Font files (.ttf, .woff2)

**Appropriate for:** Templates, boilerplate code, document templates, images, icons, fonts, or any files meant to be copied or used in the final output.

---

**Not every skill requires all three types of resources.**
