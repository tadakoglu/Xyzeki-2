import { Pipe, PipeTransform, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { emojis, EmojiService, CompressedEmojiData } from '@ctrl/ngx-emoji-mart/ngx-emoji';

/**
 * Angular2+ pipe to transform HTML containing unicode emojis to
 * HTML containing emoji image elements
 *
 * Sample usage (angular template code):
 * `<div [innerHTML]="'<a title=\'Ang🧛‍♀️ular\'>Hello</a> 👌 Ang🧛‍♀️ular 👌!' | replaceEmojis"></div>`
 *
 * By default the pipe will use the apple sheet
 * (hosted at 'https://unpkg.com/emoji-datasource-apple@4.0.4/img/apple/sheets-256/32.png')
 * - for available sheets see https://missive.github.io/emoji-mart/
 *
 * Sample usage with all available parameters (all optional!):
 * `<div [innerHTML]="html | replaceEmojis:set:size:sheetSize:backgroundImageFn"></div>`
 *
 * set: emoji mart set to use for image representation
 * size: size of an emoji image in px
 * sheetSize size of each original image - will be resized to size
 * backgroundImageFn function to retrieve bg URL or path (see docs at https://github.com/TypeCtrl/ngx-emoji-mart)
 *
 * StackBlitz sample: https://stackblitz.com/edit/pt-emoji-yrpfgo
 */
@Pipe({
    name: 'replaceEmojis'
})
export class ReplaceEmojisPipe implements PipeTransform {
    public static readonly DEFAULT_SHEET = 'apple';
    public static readonly DEFAULT_IMAGE_SIZE = 22;
    public static readonly DEFAULT_SHEET_SIZE = 64;
    private static cachedEmojiRegex: RegExp;


    /**
     * Utility method to get all text node descendants of a DOM node
     * @param node the DOM node to get text nodes for
     */
    public static getAllTextNodes(node: Node) {
        const all = [];
        for (node = node.firstChild; node; node = node.nextSibling) {
            if (node.nodeType === Node.TEXT_NODE) {
                all.push(node);
            } else {
                all.push(...ReplaceEmojisPipe.getAllTextNodes(node));
            }
        }
        return all;
    }

    constructor(@Inject(DOCUMENT) private document: Document, private sanitizer: DomSanitizer, private emojiService: EmojiService) { }

    /**
     * Pipe transform entry point
     * @param html HTML to parse
     * @param set emoji mart set to use for image representation
     * @param size size of an emoji image in px
     * @param sheetSize sheetSize (size of each original image - will be resized to size)
     * @param backgroundImageFn function to retrieve bg URL or path (see docs at https://github.com/TypeCtrl/ngx-emoji-mart)
     */
    public transform(
        html: string,
        set: '' | 'apple' | 'facebook' | 'twitter' | 'emojione' | 'google' | 'messenger' = ReplaceEmojisPipe.DEFAULT_SHEET,
        size = ReplaceEmojisPipe.DEFAULT_IMAGE_SIZE,
        sheetSize: 16 | 20 | 32 | 64 = ReplaceEmojisPipe.DEFAULT_SHEET_SIZE,
        backgroundImageFn?: (set: string, sheetSize: number) => string): SafeHtml {

        //by xyzeki
        size = 25;
        backgroundImageFn = (set: string, sheetSize: number): string => {
            return "../../assets/emoji/emojione-64.png";
        };

        return this.sanitizer.bypassSecurityTrustHtml(
            this.emojisToImages(
                html,
                set,
                size,
                sheetSize,
                backgroundImageFn
            )
        );
    }

	/**
	 * Replaces all unicode emojis available through emoji-mart with a span displaying
	 * the image representation of that emoji
	 * @param html HTML to parse
     * @param set emoji mart set to use for image representation
     * @param size size of an emoji image in px
     * @param sheetSize sheetSize (size of each original image - will be resized to size)
     * @param backgroundImageFn function to retrieve bg URL or path (see docs at https://github.com/TypeCtrl/ngx-emoji-mart)
	 */
    public emojisToImages(
        html: string,
        set: '' | 'apple' | 'facebook' | 'twitter' | 'emojione' | 'google' | 'messenger',
        size: number,
        sheetSize: 16 | 20 | 32 | 64,
        backgroundImageFn?: (set: string, sheetSize: number) => string
    ): string {
        // Ensure most html entities are parsed to unicode:
        const div = <Element>this.document.createElement('div');
        div.innerHTML = html;

        const textNodes = ReplaceEmojisPipe.getAllTextNodes(div);
        for (let currentItem of textNodes) {
            let match: RegExpExecArray;
            while ((match = this.emojiRegex.exec(currentItem.textContent)) !== null) {
                const unicodeEmoji = currentItem.textContent.substr(match.index, match[0].length);
                const hexCodeSegments = [];
                let j = 0;
                while (j < unicodeEmoji.length) {
                    const segment = unicodeEmoji.codePointAt(j).toString(16).toUpperCase();
                    hexCodeSegments.push(segment);

                    j += Math.ceil(segment.length / 4);
                }
                const hexCode = hexCodeSegments.join('-');
                const matchingData = this.findEmojiData(hexCode);
                if (matchingData) {
                    const span = document.createElement('span');
                    span.setAttribute('contenteditable', 'false');
                    span.className = 'emoji-pipe-image';

                    const styles = this.emojiService.emojiSpriteStyles(
                        matchingData.sheet,
                        set,
                        size,
                        sheetSize,
                        backgroundImageFn
                    );
                    Object.assign(span.style, styles);

                    const text = currentItem.textContent;
                    currentItem.textContent = text.substr(0, match.index);
                    currentItem.parentNode.insertBefore(span, currentItem.nextSibling);
                    currentItem = this.document.createTextNode(text.substr(match.index + match[0].length));
                    span.parentNode.insertBefore(currentItem, span.nextSibling);

                    this.emojiRegex.lastIndex = 0;
                }
            }
        }

        return div.innerHTML;
    }

	/**
	 * Regex matching all unicode emojis contained in emoji-mart
	 */
    private get emojiRegex(): RegExp {
        if (ReplaceEmojisPipe.cachedEmojiRegex) {
            return ReplaceEmojisPipe.cachedEmojiRegex;
        }

        let characterRegexStrings: string[] = [];
        for (const emoji of emojis) {
            characterRegexStrings.push(this.emojiService.unifiedToNative(emoji.unified).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

            if (emoji.skinVariations) {
                for (const skinVariation of emoji.skinVariations) {
                    characterRegexStrings.push(this.emojiService.unifiedToNative(skinVariation.unified).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
                }
            }
        }

        characterRegexStrings = characterRegexStrings.sort((a, b) => {
            if (a.length > b.length) {
                return -1;
            }

            if (b.length > a.length) {
                return 1;
            }

            return 0;
        });

        const strings = characterRegexStrings;
        const reString = '(' + strings.join('|') + ')';
        ReplaceEmojisPipe.cachedEmojiRegex = new RegExp(reString, 'gu');

        return ReplaceEmojisPipe.cachedEmojiRegex;
    }

	/**
	 * Find raw emoji-mart data for a specific emoji hex code
	 * @param hexCode String representation of the emoji hex code
	 */
    private findEmojiData(hexCode: string): CompressedEmojiData {
        for (const emojiData of emojis) {
            if (emojiData.unified === hexCode) {
                return emojiData;
            }

            if (emojiData.skinVariations) {
                for (const skinVariation of emojiData.skinVariations) {
                    if (skinVariation.unified === hexCode) {
                        const skinData = Object.assign({}, emojiData);
                        skinData.sheet = skinVariation.sheet;
                        return skinData;
                    }
                }
            }
        }

        return null;
    }
}
