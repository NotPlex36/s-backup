// ==UserScript==
// @name         TeaBD: << NotPlex >> Customizations
// @namespace    http://tampermonkey.net/
// @version      2.6
// @description  More options in Menu Bar. Replace unnecessary content. Proper file type in Torrent Upload Page. Neighbours (Profile/Torrent). SB Summary Table.
// @author       NotPlex
// @match        https://www.torrentbd.net/*
// @match        https://www.torrentbd.org/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=torrentbd.net
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...

    /******************* Featured Torrent *******************/
    const tbdFeature = {
        isActive: false,
        nextTorrent: '', // Next Torrent Title
        readyToBeQueued: {
            'Torrent Title': 'Torrent Link',
            '': '',
        },
        alreadyFeatured: {
            'Queue Added Date': 'Torrent Link',
            '': '',
        }
    }

    /****************** Utility Start ******************/
    const lastNameChageDate = 'uNameData';
    const userId = parseInt(new URLSearchParams(document.querySelector('#left-block-container .accc.account-action-buttons a[data-tippy-content="My Profile"]')?.href.split('.php')[1]).get('id'));
    const insertDivInPosition = ({classList, innerHTML, parentNode, childrenNo}) => {
        const div = document.createElement('div');
        div.classList = classList;
        div.innerHTML = innerHTML;
        parentNode.insertBefore(div, parentNode.children[childrenNo]);
    }
    const checkValidPage = (checkString = '') => {
        if(!checkString) return false;
        return window.location.pathname.includes(checkString);
    }
    const checkValidQuery = (searchFor = 'action', value = '') => {
        const urlSearchQuery = window.location.search;
        const isValidQuery = new URLSearchParams(window.location.search).get(searchFor).toLowerCase() === value.toLowerCase();
        return isValidQuery;
    }
    const doesPathnameIncludes = (checkString) => {
        const pathname = window.location.pathname;
        return pathname.toLowerCase().includes(checkString.toLowerCase());
    }
    const createNeighbourVisitBtn = (id) => {
        const idType = doesPathnameIncludes('account') ? 'Account' : doesPathnameIncludes('torrent') ? 'Torrent' : 'Forum Topic';
        const aHref = doesPathnameIncludes('account') ? 'account-details' : doesPathnameIncludes('torrent') ? 'torrents-details' : 'forums';
        return `<a href='/${ aHref }.php?${ idType === 'Forum' ? 'action=viewtopic&topicid' : 'id' }=${ id - 1 > 0 ? id - 1 : 1 }' class='otp-btn' title='Previous ${ idType }'>◄◄ ${ id - 1 > 0 ? 'Previous' : `Go to first ${idType.toLowerCase()}` }</a>
                     <span title="Click to copy current ${idType} ID"
                           class='otp-btn otp-btn-hovered otp-mx-1.25'
                           onclick="navigator.clipboard.writeText('${ idType } ID: ${id}'); alert('${idType} ID #${id} copied.');">
                                Current ${idType} #${id}
                           </span>
                     <a href='/${ aHref }.php?${ aHref === 'forums' ? 'action=viewtopic&topicid' : 'id' }=${id + 1 > 0 ? id + 1 : 1}' class='otp-btn' title='Next ${idType}'>Next ►►</a>`;
    }
    /******************* Utility End *******************/

    // Add More Options (Direct Links) to Menu Bar
    if(userId) {
        const navItems = document.querySelectorAll('#cnav-menu-container .menu-extension');
        const navItemHelp = navItems[6];
        insertDivInPosition({
            classList: 'cnav-menu-item',
            innerHTML: `<a href="support.php?user=${userId}">Support Tickets<img src="https://s13.gifyu.com/images/SXikE.png" style="filter: invert(1); margin-left: 6px;" height="12" style="border-radius: 100px;" class="mr-10"></a>`,
            parentNode: navItemHelp,
            childrenNo: 1
        });
        const navItemMore = navItems[7];
        insertDivInPosition({
            classList: 'cnav-menu-item',
            innerHTML: `<a href="/seedbonus-history.php?id=${userId}">Seedbonus Logs</a>`,
            parentNode: navItemMore,
            childrenNo: 2
        });
        insertDivInPosition({
            classList: 'cnav-menu-item',
            innerHTML: `<a href="/download-history.php?id=${userId}">Download Logs</a>`,
            parentNode: navItemMore,
            childrenNo: 2
        });
    }

    // Replace Unnecessary Content and Show Reason Accordingly in Seedbonus Page
    if(checkValidPage('seedbonus-history.php') || checkValidPage('seedbonus.php')) {
        // Get Username Change Date and Set to Browser Local Storage
        if(checkValidPage('seedbonus-history.php')) {
            Array.from(document.querySelectorAll("#middle-block table.bordered.simple-data-table tbody tr td")).some(td => {
                let temp = false;
                if(td.innerText == 'Username') {
                    const username = document.querySelector("#left-block-container>div .tbdrank").innerText;
                    const nameLastChangedOn = td.parentNode.children[0].innerText;
                    localStorage.setItem(lastNameChageDate, JSON.stringify({username, nameLastChangedOn}));
                    temp = true;
                }
                if(temp) return temp;
            });
        }

        // Replace Content with Reasons
        if(checkValidPage('seedbonus.php')) {
            const rankClassList = document.querySelector('#left-block-container span.tbdrank').classList.value;

            // Hide "Redeem Sitewide FreeLeech with Seedbonus" Content if user already enjoying 24x7 Sitewide Freeleech as per rank perk
            if(rankClassList.includes('mvp') || rankClassList.includes('wizard') || rankClassList.includes('star-uploader')) {
                document.getElementById('redeem-freeleech').nextElementSibling.innerHTML = `
               <div style="display: grid; height: 96px;"
                 title='As per your "${rankClassList.includes('mvp') ? 'MVP' : rankClassList.includes('wizard') ? 'Wizard' : 'Star Uploader'}" rank perk, you already enjoying sitewide freeleech. No need to activate FreeLeech with Seedbonus.'>
                    <p style="place-self: center; font-size: 1.5rem; font-weight: bold;"
                      class="tbdrank mvp">
                         Sitewide FreeLeech Activated
                      </p>
                </div>`;
            }

            // Hide "Upgrade your Rank" Content if user rank is Wizard / Star Uploader
            if(rankClassList.includes('wizard') || rankClassList.includes('star-uploader')) {
                document.getElementById('redeem-rank').nextElementSibling.innerHTML = `
                <div style="display: grid; height: 96px;"
                  title='You are a "${rankClassList.includes('wizard') ? 'Wizard' : 'Star Uploader'}", this is the highest rank for general users. No higher rank to upgrade.'>
                     <p style="place-self: center; font-size: 1.75rem; font-weight: bold;"
                       class="${rankClassList}">
                          ${rankClassList.includes('wizard') ? 'Wizard' : 'Star Uploader'} rank is the highest rank
                     </p>
                </div>`;
            }

            // Hide "Get new Username" Content if redeem cost isn't free / 0 (zero) or not enough seedbonus
            const newNameContentElement = document.getElementById('redeem-username').nextElementSibling;
            const newNameCost = +newNameContentElement.querySelector('table tbody>tr>td').innerText;
            const loggedInUsername = document.querySelector("#left-block-container>div .tbdrank").innerText;
            let nameLastChangedOn = '';
            const lsNameData = JSON.parse(localStorage.getItem(lastNameChageDate)) || {};
            const fullSB = +localStorage.getItem('fullSB') || 0;

            if(loggedInUsername === lsNameData?.username) {
                nameLastChangedOn = lsNameData?.nameLastChangedOn || '';
            } else {
                localStorage.removeItem(lastNameChageDate);
            }
            const titleForUsernameHiddenElement = `Current redeem will cost ${newNameCost} SeedBonus.${ nameLastChangedOn ? ` Username last changed on ${nameLastChangedOn}.` : ' [Visit Seedbonus History Page once to get Last Name Change Date]'}`;
            if(newNameCost) {
                newNameContentElement.innerHTML = `
                 <div style="display: grid; height: 96px;"
                   title="${titleForUsernameHiddenElement}">
                     <p style="place-self: center; font-size: 1.75rem; font-weight: bold;"
                       class="red100">
                          ${fullSB >= newNameCost ? "New Username Redeem Isn't Free Right Now" : "Not Enough Seedbonus to Redeem New Username"}
                     </p>
                </div>`;
            }

            // Set feature torrent link
            if(tbdFeature.isActive && tbdFeature.readyToBeQueued[tbdFeature.nextTorrent]) {
                document.querySelector("input[name='torrent_link']").value = tbdFeature.readyToBeQueued[tbdFeature.nextTorrent]+'&hit=1';
                document.querySelector("input[name='torrent_link']").focus();
            }
        }
    }

    // Accept Appropriate File Type
    if(checkValidPage('torrents-upload.php')) {
        const acceptedFormat = [".jpg", ".jpeg", ".png", ".mkv", ".mp4", ".torrent"];
        try {
            const inputFields = document.querySelectorAll("input[type='file']");
            inputFields.forEach(field => {
                field.setAttribute('accept', acceptedFormat.join(","));
            });
            document.getElementById('torr-descr').style = 'min-height: 280px; max-height: 350px; overflow-y: auto; font-size: 14px;';
        } catch(e) {
            console.log("Input Field Not Found");
            console.error(e);
        }
    }

    // Visit Neighbour Profile or Torrent
    if(checkValidPage('account-details.php') || checkValidPage('torrents-details.php') || checkValidPage('forums.php')) {
        const otpStyle = `
            .otp-flex {
                 display: flex;
            }
            .otp-justify-between {
                 justify-content: space-between;
            }
            .otp-mx-1\\.25 {
                 margin-left: 5px;
                 margin-right: 5px;
            }
            .otp-my-auto {
                 margin-top: auto;
                 margin-bottom: auto;
            }
            .otp-btn {
                 color: rgba(184, 198, 204, 1);
                 padding: 6px 8px;
                 letter-spacing: .05px;
                 border: 1px solid teal;
                 border-radius: 5px;
                 cursor: pointer;
                 font-weight: 700;
            }
            .otp-btn-hovered, .otp-btn:hover {
                 background-color: teal;
                 color: white;
                 transition: background-color 0.05s ease-in;
            }
            .otp-btn-hovered.otp-btn{
                 cursor: pointer;
            }
            @media screen and (max-width: 1279px) {
                 .otp-hidden {
                      display: none;
                 }
            }
        `;
        const head = document.querySelector('head');
        const style = document.createElement('style');
        style.textContent = otpStyle;
        head.appendChild(style);
        const cnavElement = document.querySelector('.cnav'); // Navigation Bar

        if(checkValidPage('account-details.php') || checkValidPage('torrents-details.php')) {

            const idInURL = parseInt(new URLSearchParams(window.location.search).get('id'));

            // Visit Neighbour Account
            if(checkValidPage('account-details.php')) {
                const currAccIdURL = idInURL;
                if(!currAccIdURL) window.location.replace(`/account-details.php?id=${userId}`);
                const currAccId = currAccIdURL || userId || 3559;

                insertDivInPosition({
                    classList: 'otp-my-auto otp-hidden',
                    innerHTML: createNeighbourVisitBtn(currAccId),
                    parentNode: cnavElement,
                    childrenNo: 3,
                });
            }

            // Visit Neighbour Uploaded Torrent
            if(checkValidPage('torrents-details.php')) {
                const currTorrIdURL = idInURL;
                if(!currTorrIdURL) window.location.replace('/torrents-details.php?id=1');
                const currTorrId = currTorrIdURL || 1;

                insertDivInPosition({
                    classList: 'otp-my-auto otp-hidden',
                    innerHTML: createNeighbourVisitBtn(currTorrId),
                    parentNode: cnavElement,
                    childrenNo: 3,
                });
            }
        }

        // Visit Neighbour Forum Topic
        else if(checkValidPage('forums.php') && checkValidQuery('action', 'viewtopic')) {
            const currForumTopicId = parseInt(new URLSearchParams(window.location.search).get('topicid'));
            if(!currForumTopicId) window.location.replace('/forums.php');
            const currForumId = currForumTopicId || 1;

            insertDivInPosition({
                classList: 'otp-my-auto otp-hidden',
                innerHTML: createNeighbourVisitBtn(currForumId),
                parentNode: cnavElement,
                childrenNo: 3,
            });
        }
    }

    // SB Summary Table on Seedbonus Breakdown Page
    if(checkValidPage('seedbonus-breakdown.php')) {
        const createSBRateSummeryTableBody = (tableDataObj) => {
            const tableRow = Object.keys(tableDataObj);
            return tableRow.map(rowTitle => {
                const { size, sbRate, count, currentRateTotal } = tableDataObj[rowTitle] || {};
                return `<tr>
                             <td style='padding: 5px; text-align: center;'>${ size }</td>
                             <td style='padding: 5px; text-align: center;'>${ sbRate || 'none' }</td>
                             <td style='padding: 5px; text-align: center;'>${ count || '-' }</td>
                             <td style='padding: 5px; text-align: center;'>${ new Intl.NumberFormat("en-IN").format((sbRate * count).toFixed(2)) || 'none' }</td>
                             <td style='padding: 5px; text-align: right; padding-right: 8px;'>${ new Intl.NumberFormat("en-IN").format((currentRateTotal || sbRate * count).toFixed(2)) || 'none' }</td>
                        </tr>`;
            }).join('');
        }

        try {
            window.addEventListener('load', () => {
                const sbBreakdownTableElement = document.querySelector('.table.boxed.simple-data-table');
                if(!sbBreakdownTableElement) throw new Error('SeedBonus Breakdown Table Not Found!');

                const currSeedingRows = Array.from(sbBreakdownTableElement.querySelectorAll('tr')).filter(tr => !isNaN(+tr.lastElementChild.innerText)),
                      smallTorrentCount = parseInt(document.querySelector('.uc-seeding').innerText) - currSeedingRows.length,
                      isDarkThemeActive = document.querySelector('.theme-toggle-btn')?.getAttribute('data-tippy-content').toLowerCase().includes('bright') || false;

                const tableData = {
                    '100M-': {size: 'size < 100 MiB', sbRate: 0, count: !isNaN(smallTorrentCount) ? smallTorrentCount : 0, currentRateTotal: 0},
                    '100M-1G': {size: '100 MiB ≤ size < 1 GiB', sbRate: 0.4, count: 0, currentRateTotal: 0},
                    '1-2G': {size: '1 GiB ≤ size < 2GiB', sbRate: 25, count: 0, currentRateTotal: 0},
                    '2-5G': {size: '2 GiB ≤ size < 5 GiB', sbRate: 40, count: 0, currentRateTotal: 0},
                    '5G+': {size: 'size ≥ 5 GiB', sbRate: 50, count: 0, currentRateTotal: 0},
                };

                const tableObjKeys = Object.keys(tableData);

                const modifyTableData = (dataFor, currSBRate) => {
                    tableData[dataFor].count = tableData[dataFor].count + 1 || 1;
                    tableData[dataFor].currentRateTotal = tableData[dataFor].currentRateTotal + currSBRate;
                }

                currSeedingRows.forEach(tr => {
                    const sizeText = tr.children[1].innerText,
                          currTrSBRate = +tr.children[3].innerText,
                          size = parseFloat(sizeText);
                    if(sizeText.includes('GiB')) {
                        if(size < 2) {
                            // count 1-2G
                            modifyTableData(tableObjKeys[2], currTrSBRate);
                        } else if(size < 5) {
                            // count 2-5G
                            modifyTableData(tableObjKeys[3], currTrSBRate);
                        } else {
                            // count 5G+
                            modifyTableData(tableObjKeys[4], currTrSBRate);
                        }
                    } else {
                        // count 100M-1G
                        modifyTableData(tableObjKeys[1], currTrSBRate);
                    }
                });

                const table = document.createElement('table');
                table.classList = 'table boxed striped simple-data-table ';
                table.style = 'width: 65%; min-width: 720px; margin-left: auto; margin-right: auto; padding-bottom: 28px;';
                table.innerHTML = `<caption style='font-size: 24px; font-weight: 700; margin-bottom: 12px;' class='tbdrank ${ isDarkThemeActive ? 'supreme' : 'vip' }'>Summary</caption>
                           <thead>
                                <tr style='${ isDarkThemeActive ? "background-color: #2a2a2a;" : "" }'>
                                     <th style='padding: 5px; text-align: center;'>Torrent Size</th>
                                     <th style='padding: 5px; text-align: center;'>Maximum SB<br />Per Torrent</th>
                                     <th style='padding: 5px; text-align: center;'>Torrent Count</th>
                                     <th style='padding: 5px; text-align: center;'>Maximum SB<br />Can Be Earned</th>
                                     <th style='padding: 5px; text-align: center;'>Total SB<br />Currently Getting</th>
                                </tr>
                           </thead>
                           <tbody>
                                ${createSBRateSummeryTableBody(tableData)}
                                <tr style='font-weight: 700;${ isDarkThemeActive ? " background-color: #2a2a2a;" : "" }'>
                                     <td style='padding: 5px; padding-left: 8px; font-size: 1.25rem;' colspan='2'>Total</th>
                                     <td style='padding: 5px; text-align: center; color: #66bb6a;'
                                         title='This total may not count torrents less than 100MiB'>↑ ${ Object.keys(tableData).reduce((torrCount, curr) => torrCount + tableData[curr].count, 0) }</th>
                                     <td style='padding: 5px; text-align: center;'>${ new Intl.NumberFormat("en-IN").format(tableObjKeys.reduce((total, curr) => total + tableData[curr].count * tableData[curr].sbRate, 0)) }</th>
                                     <td style='padding: 5px; text-align: right; padding-right: 8px; font-size: 1.25rem;' class='tbdrank ${ isDarkThemeActive ? 'vip' : 'supreme' }'
                                         title='This is your current SeedBonus rate (Value may vary upto ±0.1%)'>&#8776 <span style='text-decoration: underline;'>
                                     ${ new Intl.NumberFormat("en-IN").format(+currSeedingRows.map(tr => +tr.lastElementChild.innerText)
                                                                              .reduce((acc, curr) => acc+curr, 0).toFixed(1)) }</span>
                                     </td>
                                </tr>
                           </tbody>`;
                document.querySelector('#middle-block .card-panel.overflow-x').prepend(table);
            })
        }
        catch(error) {
            console.log(error);
        }
    }

    // New Customizations Here
})();
