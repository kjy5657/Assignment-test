import { routeChange } from "./router.js";
import { getItem, setItem } from "./storage.js";

export default function SelectedOptions({ $target, initialState }) {
  const $component = document.createElement("div");
  $target.appendChild($component);

  this.state = initialState;

  this.getTotalPrice = () => {
    const { product, selectedOptions } = this.state;
    const { price: productPrice } = product;

    return selectedOptions.reduce(
      (acc, option) =>
        acc + (productPrice + option.optionPrice) * option.quantity,
      0
    );
  };

  this.setState = (nextState) => {
    this.state = nextState;
    this.render();
  };

  this.render = () => {
    //selectedOptions가 없는 경우에 []로 init
    const { product, selectedOptions = [] } = this.state;

    const optionTemplates = selectedOptions
      ?.map(
        (selectedOption) =>
          `<li>
                ${selectedOption.optionName} ${
            product.price + selectedOption.optionPrice
          }원
                <input type="text" data-optionId="${
                  selectedOption.optionId
                }" value="${selectedOption.quantity}">
            </li>`
      )
      .join("");

    if (product && selectedOptions) {
      $component.innerHTML = `
            <h3>선택된 상품</h3>
            <ul>
                ${optionTemplates}
            </ul>
            <div class="ProductDetail__totalPrice">${this.getTotalPrice()}원</div>
            <button class="OrderButton">주문하기</button>`;
    }
  };

  $component.addEventListener("change", (e) => {
    console.log(e.target);
    if (e.target.tagName === "INPUT") {
      try {
        const nextQuantity = parseInt(e.target.value);
        const nextSelectedOptions = [...this.state.selectedOptions];

        if (typeof nextQuantity === "number") {
          const { product } = this.state;

          const optionId = parseInt(e.target.dataset.optionId);
          const option = product.productOptions.find(
            (option) => option.id === optionId
          );
          //수량이 바뀌는 경우니까 이미 선택된 옵션들 중에서 존재할 것
          const selectedOptionIndex = nextSelectedOptions.findIndex(
            (selectedOption) => selectedOption.optionId === optionId
          );
          nextSelectedOptions[selectedOptionIndex].quantity =
            option.stock >= nextQuantity ? nextQuantity : option.stock;

          this.setState({
            ...this.state,
            selectedOptions: nextSelectedOptions,
          });
        }
      } catch (e) {
        console.error(e);
      }
    }
  });

  $component.addEventListener("click", (e) => {
    const { selectedOptions } = this.state;

    if (e.target.className === "OrderButton") {
      const cartData = getItem("products_cart", []);
      setItem(
        "products_cart",
        cartData.concat(
          selectedOptions.map((selectedOption) => ({
            productId: selectedOption.productId,
            optionId: selectedOption.optionId,
            quantity: selectedOption.quantity,
          }))
        )
      );

      routeChange("/web/cart");
    }
  });

  this.render();
}
