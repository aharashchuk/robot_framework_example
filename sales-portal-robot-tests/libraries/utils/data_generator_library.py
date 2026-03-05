"""RF keyword library that exposes data generators as Robot Framework keywords (Phase 4)."""

from __future__ import annotations

from robot.api.deco import keyword, library


@library(scope="TEST")
class DataGeneratorLibrary:
    """Keywords for generating random test data using Faker and Pydantic models.

    Each keyword wraps the corresponding ``data/generators/generate_*.py`` function and
    returns a plain ``dict`` so that Robot Framework can pass values between keywords
    without dealing with Pydantic model instances.
    """

    # ------------------------------------------------------------------
    # Products
    # ------------------------------------------------------------------

    @keyword("Generate Product Data")
    def generate_product_data(
        self,
        name: str | None = None,
        amount: int | None = None,
        price: int | None = None,
        manufacturer: str | None = None,
        notes: str | None = None,
    ) -> dict:  # type: ignore[type-arg]
        """Return a random ``ProductData`` dict, with optional field overrides.

        Args:
            name: Override the generated product name.
            amount: Override the generated stock amount.
            price: Override the generated unit price.
            manufacturer: Override the generated manufacturer name.
            notes: Optional notes string.

        Returns:
            A plain ``dict`` matching the ``ProductData`` schema.
        """
        from data.generators.generate_product_data import generate_product_data

        kwargs: dict[str, object] = {}
        if name is not None:
            kwargs["name"] = name
        if amount is not None:
            kwargs["amount"] = int(amount)
        if price is not None:
            kwargs["price"] = int(price)
        if manufacturer is not None:
            kwargs["manufacturer"] = manufacturer
        if notes is not None:
            kwargs["notes"] = notes

        data = generate_product_data(**kwargs)  # type: ignore[arg-type]
        return data.model_dump(exclude_none=True)

    # ------------------------------------------------------------------
    # Customers
    # ------------------------------------------------------------------

    @keyword("Generate Customer Data")
    def generate_customer_data(
        self,
        email: str | None = None,
        name: str | None = None,
        country: str | None = None,
        city: str | None = None,
        street: str | None = None,
        house: int | None = None,
        flat: int | None = None,
        phone: str | None = None,
        notes: str | None = None,
    ) -> dict:  # type: ignore[type-arg]
        """Return a random ``CustomerData`` dict, with optional field overrides.

        Returns:
            A plain ``dict`` matching the ``CustomerData`` schema.
        """
        from data.generators.generate_customer_data import generate_customer_data

        kwargs: dict[str, object] = {}
        if email is not None:
            kwargs["email"] = email
        if name is not None:
            kwargs["name"] = name
        if country is not None:
            kwargs["country"] = country
        if city is not None:
            kwargs["city"] = city
        if street is not None:
            kwargs["street"] = street
        if house is not None:
            kwargs["house"] = int(house)
        if flat is not None:
            kwargs["flat"] = int(flat)
        if phone is not None:
            kwargs["phone"] = phone
        if notes is not None:
            kwargs["notes"] = notes

        data = generate_customer_data(**kwargs)  # type: ignore[arg-type]
        return data.model_dump(exclude_none=True)

    # ------------------------------------------------------------------
    # Delivery
    # ------------------------------------------------------------------

    @keyword("Generate Delivery Data")
    def generate_delivery_data(
        self,
        country: str | None = None,
        city: str | None = None,
        street: str | None = None,
        house: int | None = None,
        flat: int | None = None,
        condition: str | None = None,
        final_date: str | None = None,
        days_offset: int = 7,
    ) -> dict:  # type: ignore[type-arg]
        """Return a random ``DeliveryData`` dict, with optional field overrides.

        ``final_date`` should be in ``YYYY/MM/DD`` format (backend convention).

        Returns:
            A plain ``dict`` matching the ``DeliveryData`` schema (nested ``address``).
        """
        from data.generators.generate_delivery_data import generate_delivery_data

        kwargs: dict[str, object] = {"days_offset": int(days_offset)}
        if country is not None:
            kwargs["country"] = country
        if city is not None:
            kwargs["city"] = city
        if street is not None:
            kwargs["street"] = street
        if house is not None:
            kwargs["house"] = int(house)
        if flat is not None:
            kwargs["flat"] = int(flat)
        if condition is not None:
            kwargs["condition"] = condition
        if final_date is not None:
            kwargs["final_date"] = final_date

        data = generate_delivery_data(**kwargs)  # type: ignore[arg-type]
        return data.model_dump(by_alias=True, exclude_none=True)

    # ------------------------------------------------------------------
    # Orders
    # ------------------------------------------------------------------

    @keyword("Generate Order Data")
    def generate_order_data(
        self,
        customer_id: str,
        product_ids: list[str],
        num_products: int | None = None,
    ) -> dict:  # type: ignore[type-arg]
        """Return a random ``OrderData`` dict for the given customer and product pool.

        Args:
            customer_id: The ``_id`` of the customer to associate the order with.
            product_ids: Pool of available product ``_id`` values to pick from.
            num_products: Exact number of products to include; defaults to a
                          random count within ``[MIN_PRODUCTS_PER_ORDER,
                          MAX_PRODUCTS_PER_ORDER]``.

        Returns:
            A plain ``dict`` matching the ``OrderData`` schema.
        """
        from data.generators.generate_order_data import generate_order_data

        kwargs: dict[str, object] = {}
        if num_products is not None:
            kwargs["num_products"] = int(num_products)

        data = generate_order_data(
            customer_id=customer_id,
            product_ids=product_ids,
            **kwargs,  # type: ignore[arg-type]
        )
        return data.model_dump(exclude_none=True)

    # ------------------------------------------------------------------
    # Mock data builders (for integration / network-interception tests)
    # ------------------------------------------------------------------

    @keyword("Build Mock Customer")
    def build_mock_customer(
        self,
        name: str = "Mock Customer",
        email: str = "mock.customer@example.com",
        country: str = "USA",
    ) -> dict[str, object]:
        """Return a minimal customer dict that mirrors the backend response shape."""
        from data.generators.mock_data_builders import build_mock_customer

        return build_mock_customer(name=name, email=email, country=country)

    @keyword("Build Mock Product")
    def build_mock_product(
        self,
        name: str = "Mock Product",
        price: int = 100,
        amount: int = 10,
        manufacturer: str = "Samsung",
    ) -> dict[str, object]:
        """Return a minimal product dict that mirrors the backend response shape."""
        from data.generators.mock_data_builders import build_mock_product

        return build_mock_product(name=name, price=int(price), amount=int(amount), manufacturer=manufacturer)

    @keyword("Build Mock Order")
    def build_mock_order(self) -> dict[str, object]:
        """Return a minimal order dict that mirrors the backend response shape."""
        from data.generators.mock_data_builders import build_mock_order

        return build_mock_order()

    @keyword("Build Mock Orders List")
    def build_mock_orders_list(self, count: int = 5) -> list[dict[str, object]]:
        """Return a list of *count* mock order dicts."""
        from data.generators.mock_data_builders import build_mock_order

        return [build_mock_order() for _ in range(int(count))]
