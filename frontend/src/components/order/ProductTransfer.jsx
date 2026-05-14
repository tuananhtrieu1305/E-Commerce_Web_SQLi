import { Button, InputNumber, Transfer, Tree, theme } from "antd";
import { useState } from "react";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";

const QuantityControl = ({
  pKey,
  quantities,
  setQuantities,
  stock,
  // eslint-disable-next-line no-unused-vars
  onItemSelect,
  // eslint-disable-next-line no-unused-vars
  isSelected,
}) => {
  const quantity = quantities[pKey] || 1;

  const handleQuantityChange = (key, value) => {
    setQuantities((prev) => ({ ...prev, [key]: value }));
  };

  const increaseQuantity = (key, maxStock) => {
    setQuantities((prev) => ({
      ...prev,
      [key]: Math.min((prev[key] || 1) + 1, maxStock),
    }));
  };

  const decreaseQuantity = (key) => {
    setQuantities((prev) => ({
      ...prev,
      [key]: Math.max((prev[key] || 1) - 1, 1),
    }));
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-100">
      <span className="text-sm font-medium text-gray-700">Quantity:</span>
      <div className="flex items-center !gap-2">
        <Button
          size="small"
          type="primary"
          icon={<MinusOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            decreaseQuantity(pKey);
          }}
          disabled={quantity <= 1}
          className="flex items-center justify-center min-w-8 h-8"
        />
        <InputNumber
          size="small"
          min={1}
          max={stock}
          value={quantity}
          onChange={(value) => handleQuantityChange(pKey, value)}
          className="w-20 h-8 text-center [&_.ant-input-number-input]:text-center"
          controls={false}
          onClick={(e) => e.stopPropagation()}
        />
        <Button
          size="small"
          type="primary"
          icon={<PlusOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            increaseQuantity(pKey, stock);
          }}
          disabled={quantity >= stock}
          className="flex items-center justify-center min-w-8 h-8"
        />
        <span className="text-xs text-gray-500 ml-2 min-w-12">/ {stock}</span>
      </div>
    </div>
  );
};

const ProductTransfer = ({
  dataSource,
  targetKeys,
  onChange,
  quantities,
  setQuantities,
}) => {
  const [selectedKeys, setSelectedKeys] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const { token } = theme.useToken();

  const transferDataSource = [];
  const flatten = (list = []) => {
    list.forEach((item) => {
      transferDataSource.push(item);
      flatten(item.children);
    });
  };
  flatten(dataSource);

  const generateTree = (treeNodes = [], checkedKeys = []) =>
    treeNodes.map(({ children, ...props }) => ({
      ...props,
      disabled: checkedKeys.includes(props.key),
      children: generateTree(children, checkedKeys),
    }));

  const isChecked = (keys, eventKey) => keys.includes(eventKey);
  const renderTreeNodes = (nodes) =>
    nodes.map((node) => {
      const isParentNode = node.children && node.children.length > 0;

      return {
        ...node,
        checkable: !isParentNode,
        title: <span className="text-sm font-medium">{node.title}</span>,
        children: renderTreeNodes(node.children || []),
      };
    });

  const customTreeData = renderTreeNodes(dataSource);

  return (
    <Transfer
      targetKeys={targetKeys}
      selectedKeys={selectedKeys}
      onChange={onChange}
      onSelectChange={(source, target) =>
        setSelectedKeys([...source, ...target])
      }
      dataSource={transferDataSource}
      render={(item) => item.title}
      showSelectAll={false}
      listStyle={{ width: "100%", height: 350 }}
    >
      {({ direction, onItemSelect }) => {
        if (direction === "left") {
          const checkedKeys = [...selectedKeys, ...targetKeys];
          return (
            <div className="p-3 h-[280px] overflow-auto bg-gray-50 rounded-lg">
              <Tree
                blockNode
                checkable
                checkStrictly
                defaultExpandAll
                checkedKeys={checkedKeys}
                treeData={generateTree(customTreeData, targetKeys)}
                onCheck={(_, { node: { key, children } }) => {
                  if (!children?.length)
                    onItemSelect(key, !isChecked(checkedKeys, key));
                }}
                onSelect={(_, { node: { key, children } }) => {
                  if (!children?.length)
                    onItemSelect(key, !isChecked(checkedKeys, key));
                }}
                className="custom-tree [&_.ant-tree-node-content-wrapper]:flex [&_.ant-tree-node-content-wrapper]:items-center"
              />
            </div>
          );
        } else {
          return (
            <div className="p-3 h-[280px] overflow-auto bg-gray-50 rounded-lg">
              {targetKeys.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  No Products
                </div>
              ) : (
                targetKeys.map((key) => {
                  const item = transferDataSource.find(
                    (data) => data.key === key
                  );
                  if (!item) return null;
                  const isSelected = selectedKeys.includes(key);
                  return (
                    <div
                      key={key}
                      className="mb-3 border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div
                        className={`flex items-center px-4 py-3 cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-blue-50 border-l-4 border-l-blue-500"
                            : "bg-white hover:bg-gray-50"
                        }`}
                        onClick={() => {
                          onItemSelect(key, !isSelected);
                        }}
                      >
                        <div
                          className={`w-5 h-5 border-2 rounded mr-3 flex items-center justify-center transition-colors ${
                            isSelected
                              ? "bg-blue-500 border-blue-500"
                              : "bg-white border-gray-300"
                          }`}
                        >
                          {isSelected && (
                            <span className="text-white text-xs font-bold">
                              ✓
                            </span>
                          )}
                        </div>
                        <span className="flex-1 font-medium text-gray-800">
                          {item.title}
                        </span>
                      </div>
                      <QuantityControl
                        pKey={key}
                        quantities={quantities}
                        setQuantities={setQuantities}
                        stock={item.stock}
                        onItemSelect={onItemSelect}
                        isSelected={isSelected}
                      />
                    </div>
                  );
                })
              )}
            </div>
          );
        }
      }}
    </Transfer>
  );
};

export default ProductTransfer;
