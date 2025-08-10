/**
 * ESLint rule: no-unsafe-white
 * Flags `text-white` unless paired with an approved dark/brand background class in the same className string.
 * Approved backgrounds (configurable): bg-jade-600+, bg-navy-600+, bg-gray-800+, bg-red-600+, bg-yellow-700+, bg-black, bg-brand-jade-dark, bg-brand-navy-dark.
 */
export const noUnsafeWhiteRule = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow text-white on insufficiently dark backgrounds', recommended: false },
    schema: [
      {
        type: 'object',
        properties: {
          allowBg: { type: 'array', items: { type: 'string' } }
        },
        additionalProperties: false
      }
    ],
    messages: {
      unsafe: 'Avoid `text-white` on light/unknown background. Use semantic text token or ensure approved dark bg class is present.'
    }
  },
  create(context){
    const options = context.options?.[0] || {};
    const allowBg = new Set(options.allowBg || [
      'bg-jade-600','bg-jade-700','bg-jade-800','bg-jade-900',
      'bg-navy-600','bg-navy-700','bg-navy-800','bg-navy-900',
      'bg-gray-800','bg-gray-900','bg-black',
      'bg-red-600','bg-red-700','bg-red-800',
      'bg-yellow-700','bg-yellow-800','bg-yellow-900',
      'bg-brand-jade-dark','bg-brand-navy-dark'
    ]);
    function hasAllowedBg(classString){
      return [...allowBg].some(bg=> classString.includes(bg));
    }
    return {
      JSXAttribute(node){
        if(node.name && node.name.name === 'className') {
          const val = node.value;
          if(!val) return;
          let classString = '';
          if(val.type === 'Literal' && typeof val.value === 'string') classString = val.value;
          if(val.type === 'JSXExpressionContainer' && val.expression.type === 'Literal' && typeof val.expression.value === 'string') classString = val.expression.value;
          if(!classString) return;
          if(classString.includes('text-white') && !hasAllowedBg(classString)) {
            context.report({ node, messageId: 'unsafe' });
          }
        }
      }
    };
  }
};

export default noUnsafeWhiteRule;
