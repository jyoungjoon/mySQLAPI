const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{ model: Category }, { model: Tag }],
    });

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching products' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findByPk(productId, {
      include: [{ model: Category }, { model: Tag }],
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching product' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { product_name, price, stock, tagIds } = req.body;

    const newProduct = await Product.create({
      product_name,
      price,
      stock,
    });

    if (tagIds && tagIds.length) {
      const productTagIdArr = tagIds.map((tag_id) => ({
        product_id: newProduct.id,
        tag_id,
      }));

      await ProductTag.bulkCreate(productTagIdArr);
    }

    const product = await Product.findByPk(newProduct.id, {
      include: [Tag],
    });

    res.status(200).json(product);
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const { product_name, price, stock, tagIds } = req.body;

    await Product.update(
      {
        product_name,
        price,
        stock,
      },
      {
        where: {
          id: productId,
        },
      }
    );

    const productTags = await ProductTag.findAll({
      where: { product_id: productId },
    });

    const currentTagIds = productTags.map(({ tag_id }) => tag_id);

    const newTagIds = tagIds.filter(
      (tag_id) => !currentTagIds.includes(tag_id)
    );

    const newProductTags = newTagIds.map((tag_id) => ({
      product_id: productId,
      tag_id,
    }));

    const productTagsToRemove = productTags
      .filter(({ tag_id }) => !tagIds.includes(tag_id))
      .map(({ id }) => id);

    await Promise.all([
      ProductTag.destroy({ where: { id: productTagsToRemove } }),
      ProductTag.bulkCreate(newProductTags),
    ]);

    const updatedProduct = await Product.findByPk(productId, {
      include: [Tag],
    });

    res.json(updatedProduct);
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await product.destroy();

    await ProductTag.destroy({ where: { product_id: productId } });

    res.status(204).json({ success: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting product' });
  }
});

module.exports = router;
