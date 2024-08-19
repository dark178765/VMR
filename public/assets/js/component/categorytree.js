'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var categoryTreeElement = React.createElement;

function CategoryTree() {
    var _React$useState = React.useState([]),
        _React$useState2 = _slicedToArray(_React$useState, 2),
        tree = _React$useState2[0],
        setTree = _React$useState2[1];

    React.useEffect(function () {
        fetch('/categories').then(function (res) {
            return res.json();
        }).then(function (res) {
            setTree(res);
        });
    }, []);

    var onCategoryCheck = function onCategoryCheck(n) {
        fetch('/subcategories/' + n.slug).then(function (res) {
            return res.json();
        }).then(function (res) {
            var nodeIndex = tree.indexOf(n);

            n.children = res;

            setTree([n].concat(_toConsumableArray(tree.slice(0, nodeIndex)), _toConsumableArray(tree.slice(nodeIndex + 1))));
        });
    };

    var traverseNode = function traverseNode(node) {
        return React.createElement(
            'div',
            { key: node.title },
            React.createElement(
                'label',
                { className: 'custom_check' },
                React.createElement('input', { type: 'checkbox', name: 'select_specialist', onChange: function onChange() {
                        return onCategoryCheck(node);
                    } }),
                React.createElement('span', { className: 'checkmark' }),
                ' ',
                node.title
            ),
            node.children ? React.createElement(
                'div',
                { className: 'subChilds' },
                ' ',
                node.children.map(function (childNode) {
                    return traverseNode(childNode);
                }),
                ' '
            ) : null
        );
    };
    return tree.map(function (node) {
        return traverseNode(node);
    });
}

var treeContainer = document.querySelector('#categoryTree');
var treeRoot = ReactDOM.createRoot(treeContainer);
treeRoot.render(categoryTreeElement(CategoryTree));