export interface TreeNode<T> {
  item: T;
  children: TreeNode<T>[];
}

/**
 * Builds a nested tree from a flat list using a parentId accessor.
 * Shared by LocationsPage and CategoriesPage since both entities use the
 * same self-referencing pattern (see architecture doc, section 4).
 */
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
