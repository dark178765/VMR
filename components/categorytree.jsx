'use strict';

const categoryTreeElement = React.createElement;

function CategoryTree() {

    const [tree, setTree] = React.useState([])

    React.useEffect(() => {
        fetch('/categories').then(res => res.json()).then(res => {
            setTree(res);
        });
    }, [])

    const onCategoryCheck = (n) => {
        fetch(`/subcategories/${n.slug}`).then(res => res.json()).then(res => {
            let nodeIndex = tree.indexOf(n);

            n.children = res;

            setTree([n, ...tree.slice(0, nodeIndex), ...tree.slice(nodeIndex + 1)]);
        })
    }

    const traverseNode = (node) => {
        return (
            <div key={node.title}>
                <label className="custom_check">
                    <input type="checkbox" name="select_specialist" onChange={() => onCategoryCheck(node)} />
                    <span className="checkmark"></span> {node.title}
                </label>{node.children ? <div className="subChilds"> {node.children.map(childNode => (traverseNode(childNode)))} </div> : null}
            </div>
        );
    };
    return tree.map((node) => traverseNode(node));
}

const treeContainer = document.querySelector('#categoryTree');
const treeRoot = ReactDOM.createRoot(treeContainer);
treeRoot.render(categoryTreeElement(CategoryTree));