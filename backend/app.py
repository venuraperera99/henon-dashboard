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

@app.route('/api/rates/multiple', methods=['POST'])
def get_multiple_rates():
    """
    Get exchange rates for multiple currency pairs at once.
    
    Request Body (JSON):
        {
            "pairs": [
                {
                    "base": "USD",
                    "target": "CAD",
                    "start_date": "2023-01-01",
                    "end_date": "2023-12-31"
                },
                ...
            ]
        }
    
    Returns:
        JSON response with rates for all pairs
    
    Status Codes:
        200: Success
        400: Bad request
        500: Internal server error
    """
    try:
        data = request.get_json()
        
        if not data or 'pairs' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required field: pairs',
                'message': 'Request body must contain a "pairs" array'
            }), 400
        
        pairs = data['pairs']
        
        if not isinstance(pairs, list) or len(pairs) == 0:
            return jsonify({
                'success': False,
                'error': 'Invalid pairs format',
                'message': 'pairs must be a non-empty array'
            }), 400
        
        results = []
        errors = []
        
        for idx, pair in enumerate(pairs):
            try:
                base = pair.get('base', '').upper()
                target = pair.get('target', '').upper()
                start_date = pair.get('start_date', '')
                end_date = pair.get('end_date', datetime.now().strftime('%Y-%m-%d'))
                
                # Validate required fields
                if not base or not target or not start_date:
                    raise ValueError("Missing required fields: base, target, or start_date")
                
                # Validate currencies
                supported = ['USD', 'CAD', 'EUR']
                if base not in supported or target not in supported:
                    raise ValueError(f"Unsupported currency. Supported: {', '.join(supported)}")
                
                if base == target:
                    raise ValueError("Base and target currencies must be different")
                
                url = f"https://api.frankfurter.app/{start_date}..{end_date}"
                params = {'from': base, 'to': target}
                
                response = requests.get(url, params=params, timeout=10)
                response.raise_for_status()
                
                api_data = response.json()
                
                # Transform data
                rates = []
                if 'rates' in api_data:
                    for date_str, rate_data in api_data['rates'].items():
                        if target in rate_data:
                            rates.append({
                                'date': date_str,
                                'rate': rate_data[target]
                            })
                
                rates.sort(key=lambda x: x['date'])
                
                results.append({
                    'success': True,
                    'base_currency': base,
                    'target_currency': target,
                    'start_date': start_date,
                    'end_date': end_date,
                    'data': rates,
                    'count': len(rates)
                })
                
                logger.info(f"Fetched {len(rates)} rates for {base}/{target}")
                
            except requests.RequestException as e:
                errors.append({
                    'index': idx,
                    'pair': pair,
                    'error': f'API request failed: {str(e)}'
                })
            except ValueError as e:
                errors.append({
                    'index': idx,
                    'pair': pair,
                    'error': str(e)
                })
            except Exception as e:
                errors.append({
                    'index': idx,
                    'pair': pair,
                    'error': f'Unexpected error: {str(e)}'
                })
        
        return jsonify({
            'success': len(errors) == 0,
            'results': results,
            'errors': errors if errors else None,
            'total_pairs': len(pairs),
            'successful': len(results),
            'failed': len(errors)
        }), 200
        
    except Exception as e:
        logger.error(f"Unexpected error in multiple rates: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'message': str(e)
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
