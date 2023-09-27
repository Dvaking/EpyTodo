
const notFound = (req, res, next) => {
    res.status(404).send({ msg: 'Not found' });
}

module.exports = notFound;
