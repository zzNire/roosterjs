import { cloneModelForPaste, mergePasteContent } from './mergePasteContent';
import { convertInlineCss } from '../createModelFromHtml/convertInlineCss';
import { createPasteFragment } from './createPasteFragment';
import { generatePasteOptionFromPlugins } from './generatePasteOptionFromPlugins';
import { retrieveHtmlInfo } from './retrieveHtmlInfo';
import type {
    PasteType,
    ClipboardData,
    TrustedHTMLHandler,
    IEditor,
} from 'roosterjs-content-model-types';

/**
 * Paste into editor using a clipboardData object
 * @param editor The Editor object.
 * @param clipboardData Clipboard data retrieved from clipboard
 * @param pasteType Type of content to paste. @default normal
 */
export function paste(
    editor: IEditor,
    clipboardData: ClipboardData,
    pasteType: PasteType = 'normal'
) {
    editor.focus();

    const trustedHTMLHandler = editor.getTrustedHTMLHandler();

    if (!clipboardData.modelBeforePaste) {
        editor.formatContentModel(model => {
            clipboardData.modelBeforePaste = cloneModelForPaste(model);

            return false;
        });
    }

    // 1. Prepare variables
    const doc = createDOMFromHtml(clipboardData.rawHtml, trustedHTMLHandler);

    // 2. Handle HTML from clipboard
    const htmlFromClipboard = retrieveHtmlInfo(doc, clipboardData);

    // 3. Create target fragment
    const sourceFragment = createPasteFragment(
        editor.getDocument(),
        clipboardData,
        pasteType,
        (clipboardData.rawHtml == clipboardData.html
            ? doc
            : createDOMFromHtml(clipboardData.html, trustedHTMLHandler)
        )?.body
    );

    // 4. Trigger BeforePaste event to allow plugins modify the fragment
    const eventResult = generatePasteOptionFromPlugins(
        editor,
        clipboardData,
        sourceFragment,
        htmlFromClipboard,
        pasteType
    );

    // 5. Convert global CSS to inline CSS
    convertInlineCss(eventResult.fragment, htmlFromClipboard.globalCssRules);

    // 6. Merge pasted content into main Content Model
    mergePasteContent(editor, eventResult, clipboardData);
}

function createDOMFromHtml(
    html: string | null | undefined,
    trustedHTMLHandler: TrustedHTMLHandler
): Document | null {
    return html ? new DOMParser().parseFromString(trustedHTMLHandler(html), 'text/html') : null;
}
