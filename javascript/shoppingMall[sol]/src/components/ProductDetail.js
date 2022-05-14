import SelectedOptions from "./SelectedOptions.js";

export default function ProductDetail({ $target, initialState }) {
  const $productDetail = document.createElement("div");

  let selectedOptions = null;

  $productDetail.className = "ProductDetail";

  $target.appendChild($productDetail);

  this.state = initialState;

  this.setState = (nextState) => {
    this.state = nextState;
    this.render();

    if (selectedOptions) {
      selectedOptions.setState({
        ...this.state,
        selectedOptions: this.state.selectedOptions,
      });
    }
  };

  this.render = () => {
    const { product } = this.state;

    const optionTemplates = product?.productOptions
      ?.map(
        (option) => `
        <option value="${option.id}" ${option.stock === 0 ? "disabled" : ""}>
            ${option.stock === 0 ? "(품절) " : ""}${product.name} ${
          option.name
        } ${option.price > 0 ? `(${option.price}원)` : ""}
        </option>`
      )
      .join("");

    $productDetail.innerHTML = `
        <img src="${product.imageUrl}">
        <div class="ProductDetail__info">
            <h2>${product.name}</h2>
            <div class="ProductDetail__price">${product.price}원~</div>
            <select>
                <option>선택하세요.</option>
                ${optionTemplates}
            </select>
            <div class="ProductDetail__selectedOptions"></div>
        </div> `;

    selectedOptions = new SelectedOptions({
      $target: $productDetail.querySelector(".ProductDetail__selectedOptions"),
      initialState: {
        product: this.state.product,
        selectedOptions: this.state.selectedOptions,
      },
    });
  };

  $productDetail.addEventListener("change", (e) => {
    if (e.target.tagName === "SELECT") {
      const selectedOptionId = parseInt(e.target.value);
      const { product, selectedOptions } = this.state;

      //product의 productOptions에서 체크(API체크)
      const option = product.productOptions.find(
        (option) => option.id === selectedOptionId
      );

      //현재 선택된 옵션들 중에 이미 있는지 체크
      const selectedOption = selectedOptions.find(
        (selectedOption) => selectedOption.optionId === selectedOptionId
      );

      //이미 선택된 옵션에 안들어있고, API에서도 있으면, 추가
      if (option && !selectedOption) {
        const nextSelectedOptions = [
          ...selectedOptions,
          {
            productId: product.id,
            optionId: option.id,
            optionName: option.name,
            optionPrice: option.price,
            quantity: 1,
          },
        ];
        this.setState({
          ...this.state,
          selectedOptions: nextSelectedOptions,
        });
      }
    }
  });

  this.render();
}
