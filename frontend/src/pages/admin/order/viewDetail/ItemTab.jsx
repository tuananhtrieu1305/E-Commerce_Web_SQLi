import { Carousel } from "antd";

const ItemTab = (props) => {
  const { orderDataDetail } = props;

  const onChange = (currentSlide) => {
    console.log(currentSlide);
  };

  return (
    <div className="w-[800px]">
      <Carousel afterChange={onChange} arrows infinite={false}>
        {orderDataDetail?.order_items.map((item) => {
          return (
            <div id={item.id} className="text-center p-[20px]">
              <div className="border-2 border-black mx-auto p-[10px] text-2xl border-b-0 rounded-t-xl w-[700px] bg-gray-800 text-white font-semibold">
                {item.product_name}
              </div>
              <div className="border-2 border-black mx-auto rounded-b-xl w-[700px]">
                <span className="w-1/2 text-center inline-block p-[10px] border-r-2">
                  <strong>Quantity</strong>: {item.item_quantity}
                </span>
                <span className="w-1/2 text-center inline-block p-[10px]">
                  <strong>Price</strong>: {item.item_price}
                </span>
              </div>
            </div>
          );
        })}
      </Carousel>
    </div>
  );
};
export default ItemTab;
