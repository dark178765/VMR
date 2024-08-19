export const helper = {
    convertArrayToObject(arr) {
        let obj = {};
        arr.forEach(er => {
            obj[er.fieldName] = er.fieldValue?.trim();
        });
        return obj;
    },
    replaceString(str: string, obj: {}) {
        for (var p in obj) {
            str = str.replace(new RegExp(`{{${p}}}`, 'gmi'), obj[p]);
        }
        return str;
    }
}