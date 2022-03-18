const fs = require('fs');
module.exports = {
	async asyncSort(arr, compare, left = 0, right = arr.length - 1) {
		if (left < right) {
			let i = left,
				j = right,
				tmp;
			const pivot = await getPivot(
				arr[i],
				arr[i + Math.floor((j - i) / 2)],
				arr[j],
				compare
			);
			while (true) {
				while ((await compare(arr[i], pivot)) < 0) {
					i++;
				}
				while ((await compare(pivot, arr[j])) < 0) {
					j--;
				}
				if (i >= j) {
					break;
				}
				tmp = arr[i];
				arr[i] = arr[j];
				arr[j] = tmp;

				i++;
				j--;
			}
			await module.exports.asyncSort(arr, compare, left, i - 1);
			await module.exports.asyncSort(arr, compare, j + 1, right);
		}
		return arr;
	},
	ObjectLength(object) {
		var length = 0;
		for (var key in object) {
			if (object.hasOwnProperty(key)) {
				++length;
			}
		}
		return length;
	},
	avgCompleteTime(amount) {
	    /* Since every computer have different completion speed, We have to collect the last completion data to get the average completion time */
	    const {time, userSize} = JSON.parse(fs.readFileSync('./data.txt', 'utf8'));
		return amount * ((time / userSize) || 1.5);
	},
	completeTime(now, before) {
		return (now - before) / 1000;
	}
};
async function getPivot(x, y, z, compare) {
	if ((await compare(x, y)) < 0) {
		if ((await compare(y, z)) < 0) {
			return y;
		} else if ((await compare(z, x)) < 0) {
			return x;
		} else {
			return z;
		}
	} else if ((await compare(y, z)) > 0) {
		return y;
	} else if ((await compare(z, x)) > 0) {
		return x;
	} else {
		return z;
	}
}
