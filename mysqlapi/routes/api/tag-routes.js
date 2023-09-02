const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

router.get('/', async (req, res) => {
  try {
    const tags = await Tag.findAll({
      include: [
        {
          model: Product,
          through: { attributes: [] },
        },
      ],
    });

    res.json(tags);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching tags' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const tagId = req.params.id;

    const tag = await Tag.findByPk(tagId, {
      include: [
        {
          model: Product,
          through: { attributes: [] },
        },
      ],
    });

    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    res.json(tag);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching tag' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { tag_name } = req.body;

    const newTag = await Tag.create({
      tag_name,
    });

    res.status(201).json(newTag);
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const tagId = req.params.id;

    const { tag_name } = req.body;

    const existingTag = await Tag.findByPk(tagId);

    if (!existingTag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    await existingTag.update({ tag_name: tag_name });

    res.json(existingTag);
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const tagId = req.params.id;

    const existingTag = await Tag.findByPk(tagId);

    if (!existingTag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    await existingTag.destroy();

    await ProductTag.destroy({ where: { tag_id: tagId } });

    res.status(204).json({ success: 'Tag deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting tag' });
  }
});

module.exports = router;
