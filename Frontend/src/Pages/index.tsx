import BoxCard from "../Components/Card";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, A11y, Autoplay } from "swiper/modules";

import "swiper/css/bundle";

export default function Index() {
  const items = [
    {
      id: 1,
      title: "Toyota Camry",
      image:
        "https://dev.checkraka.com/uploaded/_resize/max275x150/93/930ad03a564b9f3c04b567454d0c1136.webp",
    },
    {
      id: 2,
      title: "Honda Accord",
      image:
        "https://dev.checkraka.com/uploaded/_resize/max275x150/93/930ad03a564b9f3c04b567454d0c1136.webp",
    },
    {
      id: 3,
      title: "Ford Focus",
      image:
        "https://dev.checkraka.com/uploaded/_resize/max275x150/93/930ad03a564b9f3c04b567454d0c1136.webp",
    },
    {
      id: 4,
      title: "Ford Focus",
      image:
        "https://dev.checkraka.com/uploaded/_resize/max275x150/93/930ad03a564b9f3c04b567454d0c1136.webp",
    },
  ];
  return (
 
      

        <div className="max-w-7xl mx-auto p-4">
          <div className=" rounded-md w-full bg-content2 p-4 flex flex-col gap-2">
            <section className="p-4">
              <h2 className="font-bold text-xl mb-2">New Car</h2>

              <Swiper
                modules={[Pagination, A11y]}
                spaceBetween={20}
                slidesPerView={4}
                loop={true}
                pagination={{ clickable: true, dynamicBullets: true }}
              >
                {items.map((item) => (
                  <SwiperSlide key={item.id}>
                    <BoxCard>
                      <img src={item.image} alt={item.title} />
                      <p className="text-xl font-bold">{item.title}</p>
                    </BoxCard>
                  </SwiperSlide>
                ))}
              </Swiper>
            </section>
            <section className="p-4">
              <h2 className="font-bold text-xl mb-2">New Motorcycle</h2>


              <Swiper
                modules={[Pagination, A11y]}
                spaceBetween={20}
                slidesPerView={4}
                loop={true}
                pagination={{ clickable: true, dynamicBullets: true }}
              >
                {items.map((item) => (
                  <SwiperSlide key={item.id}>
                    <BoxCard>
                      <img src={item.image} alt={item.title} />
                      <p className="text-xl font-bold">{item.title}</p>
                    </BoxCard>
                  </SwiperSlide>
                ))}
              </Swiper>
                </section>


          </div>
        </div>
  );
}
