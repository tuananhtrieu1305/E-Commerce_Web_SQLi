import { Carousel, Image, Empty } from "antd";
import { BACKEND_URL } from "../../../../utils/config";

const ImageProductTab = (props) => {
  const { productDataDetail } = props;
  const images = productDataDetail?.imagePaths;

  if (!images || images.length === 0) {
    return <Empty description="Product has no images" />;
  }

  return (
    <div className="w-[800px]">
      <Carousel arrows infinite={false}>
        {images.map((image) => {
          const image_url = `${BACKEND_URL}${
            image.image_path
          }`;
          return (
            <div key={image.id} className="h-[200px] !w-[700px] ml-[50px]">
              <div className="!flex !items-center !justify-center h-full w-full">
                <Image src={image_url} alt={productDataDetail?.title} />
              </div>
            </div>
          );
        })}
      </Carousel>
    </div>
  );
};
export default ImageProductTab;
