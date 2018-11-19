var GoogleSpreadsheet = require("google-spreadsheet");
var path = require("path");

var creds = require(path.join(process.cwd(), process.env.CREDENTIALS_PATH));  
var document = new GoogleSpreadsheet(process.env.SPREADSHEET_KEY);

function appendExpenseAsync(sheetTitle, sum, category, description) {
    
    if (typeof description !== 'string' || description.trim().length === 0) {
        description = undefined;
    }

    return getLastFilledRowNumberAsync(sheetTitle).then(num => {
        return getSheetByTitleAsync(sheetTitle).then(sheet => ({ num, sheet }));
    }).then(({num, sheet}) => {
        return getCellsAsync(sheet.id, {
            "min-row": num + 1,
            "max-row": num + 1,
            "min-col": 1,
            "max-col": 4,
            "return-empty": true
        }).then(cells => ({ cells, sheet }));        
    }).then(({cells, sheet}) => {        
        cells[0].value = category;
        cells[1].value = sum;
        cells[3].value = new Date().toUTCString();

        if (description !== undefined) {
            cells[2].value = description;
        }

        return new Promise((resolve, reject) => {
            sheet.bulkUpdateCells(cells, err => {
                if (err) {
                    reject(err)
                } else {
                    resolve();
                }
            })
        });
    })
}

function getLastFilledRowNumberAsync(sheetTitle) {
    return getSheetByTitleAsync(sheetTitle).then(sheet => {
        return getCellsAsync(sheet.id, {
            "min-row": 1,
            "max-row": sheet.rowCount,
            "min-col": 1,
            "max-col": 1,
            "return-empty": true
        });
    }).then(cells => {
        var lastIdx = 0;        
        for (var i = 0; i < cells.length; i++) {
            var value = cells[i].value;
            if (typeof value === 'string' && value.length > 0) {                        
                lastIdx = i;
            }                        
        }
        return lastIdx + 1
    })
}


function getCellsAsync(sheetId, options) {    
    if (!sheetId) throw new Error("Invalid sheet id provided");  
    return authorizeAsync().then(() => {
        return new Promise((resolve, reject) => {
            document.getCells(sheetId, options, (err, cells) => {
                if (err) {
                    return reject(err);
                } else {
                    return resolve(cells)
                }
            });
        })
    });
}



function authorizeAsync() {
    return new Promise((resolve, reject) => {   
        document.useServiceAccountAuth(creds, (err) => {
            if (err) {
                reject(err)
            } else {
                resolve();
            }
        });
    })    
}

var cachedInfo = null;
function getInfoAsync() {
    return authorizeAsync().then(() => {
        if (cachedInfo !== null) {
            return Promise.resolve(cachedInfo);
        } else {
            return new Promise((resolve, reject) => {
                document.getInfo((err, info) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(info);
                    }
                });
            });
        }
    });
}

var cachedSheets = null;
function getSheetsAsync() {
    if (cachedSheets !== null) {
        return Promise.resolve(cachedSheets);
    } else {
        return getInfoAsync().then(info => {
            return info.worksheets;
        })
    }
}

function getSheetByTitleAsync(title) {
    if (!title) throw new Error("Invalid sheet title provided");
    return getSheetsAsync().then(sheets => {
        var sheet = sheets.find(w => w.title === title);
        if (sheet === undefined) {
            throw new Error(`Can't find sheet named ${title}`);
        } else {
            return sheet;
        }
    })
}


var cachedCategories = null;
function getCategoriesAsync() {
    if (cachedCategories !== null) {
        return Promise.resolve(cachedCategories)
    } else {
        return getSheetByTitleAsync(process.env.CATEGORIES_SHEET_TITLE).then(sheet => {
            return sheet;
        }).then(sheet => {
            return getCellsAsync(sheet.id, {
                "min-row": 1,
                "max-row": sheet.rowCount,
                "min-col": 1,
                "max-col": 1,
                "return-empty": false
            })
        }).then(cells => {
            return (cachedCategories = cells.map(c => c.value));
        })        
    }
}

function getCategoriesAsyncGroupedBy(n) {
    n = n || 2;
    return getCategoriesAsync().then(categories => {
        var grouped = [];               
        for (var i = 0; i < categories.length; i++) {
            var ii = Math.floor(i / n);
            if (grouped[ii] === undefined) grouped[ii] = [];
            grouped[ii].push(categories[i]);
        }
        return grouped;
    });
    
}

function fillCacheValues() {
    return Promise.all([
        getCategoriesAsync(),
        getSheetsAsync()
    ])
}

function clearCachedValues() {
    cachedCategories = null;
    cachedSheets = null;
    cachedInfo = null;
}

module.exports = {
    getCategoriesAsync,
    getCategoriesAsyncGroupedBy,
    appendExpenseAsync,
    clearCachedValues,
    fillCacheValues
};