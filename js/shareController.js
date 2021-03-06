/*
 *  The MIT License (MIT)
 *
 * Copyright (c) 2016-2017 The Regents of the University of California
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 * associated documentation files (the "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the
 * following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial
 * portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
 * BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,  FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

import {shortSessionURL} from './shareHelper.js';
import {QRCode} from './qrcode.js';
import Globals from "./globals.js"

class ShareController {

    constructor($appContainer, browser, shareConfig) {

        const embedTarget = shareConfig.embedTarget || getEmbedTarget();

        shareConfig.$modal.on('show.bs.modal', async function (e) {

            let href = window.location.href.slice();
            const idx = href.indexOf("?");
            if (idx > 0) {
                href = href.substring(0, idx);
            }

            const session = Globals.browser.compressedSession();

            if (embedTarget) {
                const snippet = getEmbeddableSnippet($appContainer, embedTarget, session);
                shareConfig.$embed_container.find('textarea').val(snippet);
                shareConfig.$embed_container.find('textarea').get(0).select();
            }

            const shortURL = await shortSessionURL(href, session);
            shareConfig.$share_input.val(shortURL);
            shareConfig.$share_input.get(0).select();
            shareConfig.$email_button.attr('href', 'mailto:?body=' + shortURL);

            // QR code generation
            shareConfig.$qrcode_image.empty();
            const obj =
                {
                    width: 128,
                    height: 128,
                    correctLevel: QRCode.CorrectLevel.H
                };

            const qrcode = new QRCode(shareConfig.$qrcode_image.get(0), obj);
            qrcode.makeCode(shortURL);

            if (shareConfig.$tweet_button_container) {
                shareConfig.$tweet_button_container.empty();
                const obj = {text: ''};
                window.twttr.widgets.createShareButton(shortURL, shareConfig.$tweet_button_container.get(0), obj);
            }
        });

        shareConfig.$modal.on('hidden.bs.modal', function (e) {
            shareConfig.$embed_container.hide();
            shareConfig.$qrcode_image.hide();
        });

        shareConfig.$copy_link_button.on('click', function (e) {
            shareConfig.$share_input.get(0).select();
            const success = document.execCommand('copy');
            if (success) {
                shareConfig.$modal.modal('hide');
            } else {
                console.log('fail!');
            }
        });


        if (undefined === embedTarget) {
            shareConfig.$embed_button.hide();
        } else {
            shareConfig.$embed_container.find('button').on('click', function (e) {
                var success;

                shareConfig.$embed_container.find('textarea').get(0).select();
                success = document.execCommand('copy');

                if (success) {
                    shareConfig.$modal.modal('hide');
                } else {
                    console.log('fail!');
                }
            });

            shareConfig.$embed_button.on('click', function (e) {
                shareConfig.$qrcode_image.hide();
                shareConfig.$embed_container.toggle();
            });
        }

        shareConfig.$qrcode_button.on('click', function (e) {
            shareConfig.$embed_container.hide();
            shareConfig.$qrcode_image.toggle();
        });

    }
}

function getEmbeddableSnippet($appContainer, embedTarget, session) {
    const embedUrl = embedTarget + "?sessionURL=blob:" + session;
    const height = $appContainer.height() + 50;
    return '<iframe src="' + embedUrl + '" style="width:100%; height:' + height + 'px"  allowfullscreen></iframe>';
}

/**
 * Get the default embed html target.  Assumes an "embed.html" file in same directory as this page
 */
function getEmbedTarget() {

    let href = window.location.href.slice();
    let idx = href.indexOf("?");
    if (idx > 0) {
        href = href.substring(0, idx);
    }
    idx = href.lastIndexOf("/");
    return href.substring(0, idx) + "/embed.html"

}


export default ShareController;
