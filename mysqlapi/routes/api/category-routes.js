const router = require('express').Router();
const { Category, Product } = require('../../models');

router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: Product,
    });

    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching categories' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;

    const category = await Category.findByPk(categoryId, {
      include: Product,
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching category' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { category_name } = req.body;

    const newCategory = await Category.create({
      category_name: category_name,
    });

    res.status(201).json(newCategory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating category' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { category_name } = req.body;
    const existingCategory = await Category.findByPk(categoryId);

    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await existingCategory.update({ category_name: category_name });

    res.json(existingCategory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating category' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;
    const existingCategory = await Category.findByPk(categoryId);
    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }
    await existingCategory.destroy();

    res.status(200).json({ success: 'Category deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting category' });
  }
});

module.exports = router;
