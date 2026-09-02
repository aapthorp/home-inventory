export interface TreeNode<T> {
  item: T;
  children: TreeNode<T>[];
}

/** Builds a nested tree from a flat list using a parentId accessor — shared by
 *  Location and Category, both self-referencing (see architecture doc, section 4). */
export function buildTree<T extends { id: string }>(
  items: T[],
  getParentId: (item: T) => string | null
): TreeNode<T>[] {
  const byId = new Map<string, TreeNode<T>>();
  items.forEach((item) => byId.set(item.id, { item, children: [] }));

  const roots: TreeNode<T>[] = [];
  items.forEach((item) => {
    const node = byId.get(item.id)!;
    const parentId = getParentId(item);
    const parentNode = parentId ? byId.get(parentId) : undefined;
    if (parentNode) {
      parentNode.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

export function flattenForPicker<T extends { id: string; name: string }>(
  items: T[],
  getParentId: (item: T) => string | null
): { id: string; label: string; depth: number }[] {
  const tree = buildTree(items, getParentId);
  const result: { id: string; label: string; depth: number }[] = [];
  function walk(nodes: TreeNode<T>[], depth: number) {
    for (const node of nodes) {
      result.push({ id: node.item.id, label: node.item.name, depth });
      walk(node.children, depth + 1);
    }
  }
  walk(tree, 0);
  return result;
}
