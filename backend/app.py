from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import requests
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access

# Base URL for the Frankfurt Exchange Rates API
FRANKFURT_API_URL = "https://api.frankfurter.app"


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'service': 'currency-exchange-api',
        'timestamp': datetime.utcnow().isoformat()
    }), 200


@app.route('/api/rates', methods=['GET'])
def get_rates():
    """
    Get exchange rates from the Frankfurt API.

    Query Parameters:
        base (str): Base currency code (e.g., USD, EUR, CAD)
        target (str): Target currency code (optional)
        start_date (str): Start date in YYYY-MM-DD format (optional)
        end_date (str): End date in YYYY-MM-DD format (optional)
    """
    try:
        base_currency = request.args.get('base', '').upper()
        target_currency = request.args.get('target', '').upper()
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        if not base_currency:
            return jsonify({
                'success': False,
                'error': 'Missing required parameter: base',
                'message': 'Base currency code is required (USD, CAD, EUR, etc.)'
            }), 400

        # Construct Frankfurt API URL
        if start_date and end_date:
            url = f"{FRANKFURT_API_URL}/{start_date}..{end_date}"
        elif start_date:
            url = f"{FRANKFURT_API_URL}/{start_date}"
        else:
            url = f"{FRANKFURT_API_URL}/latest"

        params = {'from': base_currency}
        if target_currency:
            params['to'] = target_currency

        # Call the API
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()

        return jsonify({
            'success': True,
            'data': data
        }), 200

    except requests.RequestException as e:
        logger.error(f"External API error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'External API error',
            'message': 'Failed to fetch data from Frankfurt API',
            'details': str(e)
        }), 500

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'message': 'An unexpected error occurred',
            'details': str(e)
        }), 500
    

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({
        'success': False,
        'error': 'Not found',
        'message': 'The requested endpoint does not exist'
    }), 404


@app.errorhandler(405)
def method_not_allowed(error):
    """Handle 405 errors."""
    return jsonify({
        'success': False,
        'error': 'Method not allowed',
        'message': 'The HTTP method is not allowed for this endpoint'
    }), 405


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({
        'success': False,
        'error': 'Internal server error',
        'message': 'An unexpected error occurred'
    }), 500


if __name__ == '__main__':
    # Run Flask in development mode
    app.run(host='0.0.0.0', port=5000, debug=True)
